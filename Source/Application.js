import EXPRESS from "express";
import COOKIE_PARSER from "cookie-parser";
import PROCESS from "node:process";
import CORS from "cors";
import HELMET from "helmet";
import RATE_LIMIT from "express-rate-limit";
import MORGAN from "morgan";
import { CLOSE_DATABASE_CONNECTION } from "./Database.js";
import {
    ALLOWED_ORIGINS,
    METHODS,
    ALLOWED_HEADERS,
    CREDENTIALS,
    PREF_LIGHT_CONTINUE,
    OPTIONS_SUCCESS_STATUS,
    PORT,
    ERROR,
    MESSAGE,
    SHUTDOWN,
    UNHANDLED_REJECTION,
    UNCAUGHT_EXCEPTION,
    SIGTERM,
    SIGINT,
} from "./Utilities/Constants.js";
import { LOG_ERROR, LOG_INFO } from "./Utilities/WinstonLogger.js";
import { API_RESPONSE } from "./Utilities/ApiResponse.js";
import { API_ERROR } from "./Utilities/ApiError.js";

const APPLICATION = EXPRESS();

APPLICATION.use(EXPRESS.json({ limit: "16kb" }));
APPLICATION.use(EXPRESS.urlencoded({ extended: true, limit: "16kb" }));
APPLICATION.use('/static', EXPRESS.static("public"));
APPLICATION.use(COOKIE_PARSER());

const CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: METHODS,
    allowedHeaders: ALLOWED_HEADERS,
    credentials: CREDENTIALS,
    preflightContinue: PREF_LIGHT_CONTINUE,
    optionsSuccessStatus: OPTIONS_SUCCESS_STATUS
};

APPLICATION.use(CORS(CorsOptions));
APPLICATION.use(HELMET());

const Limiter = RATE_LIMIT({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, Please try again later.",
});

APPLICATION.use(Limiter);
APPLICATION.use(MORGAN('combined'));

import TestRouters from "./Routes/Test.Routes.js";
import UserRouters from "./Routes/User.Routes.js";

APPLICATION.get("/health", (Request, Response) => {
    return Response.status(201).json(
        new API_RESPONSE(
            200,
            [
                {
                    message: `Worker ${PROCESS.pid} is handling the task...!`,
                }
            ],
            "Successfully Connected To The Server...!")
    );
});
APPLICATION.use("/api/v1", TestRouters);
APPLICATION.use("/api/v1", UserRouters);

APPLICATION.use((Error, Request, Response, Next) => {
    LOG_ERROR({ label: "Application.js", service: "Error Handling Middleware", error: Error.stack }); // Log error details for internal use

    if (Error instanceof API_ERROR) {
        return Response.status(Error.statusCode).json({
            statusCode: Error?.statusCode,
            success: Error?.success,
            data: Error?.data,
            message: Error?.message,
            errors: Error?.errors,
        });
    } else {
        return Response.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});

APPLICATION.use((Request, Response, Next) => {
    return Response.status(404).json({
        statusCode: 404,
        success: false,
        data: null,
        message: "Route not found...!",
        errors: [{ message: "Route not found...!" }],
    }); // Send a 404 status and message
});

const START_SERVER = async () => {
    try {
        APPLICATION.on(ERROR, (error) => {
            LOG_ERROR({ label: "Application.js", service: "Server", error: `Application Error: ${error?.message}` });

            throw new API_ERROR(
                error?.statusCode || 500,
                error?.message || "An unknown error occurred...!",
                [
                    {
                        label: "Application.js",
                        service: "START_SERVER APPLICATION.on(ERROR)",
                        error: `Application Error: ${error}`,
                    }
                ],
                error?.stack
            );
        });

        if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
            throw new API_ERROR(
                500,
                `Invalid PORT value: ${PORT}`,
                [
                    {
                        label: "Application.js",
                        service: "START_SERVER PORT Error",
                    }
                ]
            );
        }

        const Server = APPLICATION.listen((PORT), () => {
            LOG_INFO({
                label: "Application.js",
                service: "START_SERVER APPLICATION.listen",
                message: {
                    worker: `Worker ${PROCESS.pid} started`,
                    server: `Server is running on PORT = ${PORT}`,
                }
            });
        });

        const GracefullyShutdownServer = async (exitCode) => {
            LOG_INFO({
                label: "Application.js",
                service: "GracefullyShutdownServer",
                message: `Worker ${PROCESS.pid} is shutting down...!`
            });

            try {
                await CLOSE_DATABASE_CONNECTION();
            } catch (error) {
                LOG_ERROR({
                    label: "Application.js",
                    service: "GracefullyShutdownServer",
                    error: `Error during database shutdown: ${error}`
                });
            }

            Server.close(() => {
                LOG_INFO({
                    label: "Application.js",
                    service: "Server.close",
                    message: `Worker ${PROCESS.pid} has shut down...!`
                });

                PROCESS.exit(exitCode);
            });
        }

        PROCESS.on(MESSAGE, (message) => {
            if (message === SHUTDOWN) {
                GracefullyShutdownServer(0); // Gracefully shut down with exit code (0).
            }
        });

        PROCESS.on(UNHANDLED_REJECTION, (reason, promise) => {
            LOG_ERROR({
                label: "Application.js",
                service: "Unhandled Rejection",
                error: `Unhandled Rejection at: ${promise}, reason: ${reason}`
            });

            GracefullyShutdownServer(1); // Gracefully shut down with exit code (1).
        });

        PROCESS.on(UNCAUGHT_EXCEPTION, (error) => {
            LOG_ERROR({
                label: "Application.js",
                service: "Uncaught Exception",
                error: `Uncaught Exception: ${error}`
            });

            GracefullyShutdownServer(1); // Gracefully shut down with exit code (1).
        });

        PROCESS.on(SIGTERM, () => {
            GracefullyShutdownServer(0);
        });

        PROCESS.on(SIGINT, () => {
            GracefullyShutdownServer(0);
        });
    } catch (error) {
        LOG_ERROR({
            label: "Application.js",
            service: "starting server catch",
            error: `Error starting server: ${error.message}`
        });

        PROCESS.exit(1);
    }
}

export { APPLICATION, START_SERVER };