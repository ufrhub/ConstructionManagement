import DOTENV from "dotenv";
import PATH from "node:path";
import URL from "node:url";
import CLUSTER from "node:cluster";
import OPERATING_SYSTEM from "node:os";
import PROCESS from "node:process";
import { CONNECT_DATABASE } from "./Database.js";
import {
    CONNECT,
    ONLINE,
    MESSAGE,
    SHUTDOWN,
    EXIT,
    UNHANDLED_REJECTION,
    UNCAUGHT_EXCEPTION,
    SIGTERM,
    SIGINT,
    DISCONNECT,
    LISTENING,
    FORK,
} from "./Utilities/Constants.js";
import { START_SERVER } from "./Application.js";
import { LOG_ERROR, LOG_WARN, LOG_INFO } from "./Utilities/WinstonLogger.js";

const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

const totalCPUs = OPERATING_SYSTEM.cpus().length;
const ForkedWorkers = [];

if (PROCESS.platform !== 'win32') {
    CLUSTER.schedulingPolicy = CLUSTER.SCHED_RR; // Set to Round-Robin
} else {
    CLUSTER.schedulingPolicy = CLUSTER.SCHED_NONE; // Leave it to the Operating System
}

(() => {
    if (CLUSTER.isPrimary) {
        LOG_INFO({
            label: "Server.js",
            service: "Primary Worker",
            message: `Primary Worker ${PROCESS.pid} is running...!`,
        });

        for (let i = 0; i < totalCPUs; i++) {
            CLUSTER.fork();
        }

        CLUSTER.on(FORK, (worker) => {
            ForkedWorkers.push(worker.process.pid);
        });

        CLUSTER.on(ONLINE, (worker) => {
            if (ForkedWorkers.includes(worker.process.pid)) {
                worker.send(ONLINE);
            }
        });

        CLUSTER.on(LISTENING, (worker, address) => {
            if (ForkedWorkers.includes(worker.process.pid)) return;

            LOG_INFO({
                label: "Server.js",
                service: "Listening",
                message: `Worker ${worker.process.pid} is listening on ${address.address}:${address.port}`,
            });
        });

        CLUSTER.on(DISCONNECT, (worker) => {
            LOG_WARN({
                label: "Server.js",
                service: "Disconnect",
                message: `Worker ${worker.process.pid} disconnected`,
            });
        });

        CLUSTER.on(EXIT, (worker, code, signal) => {
            LOG_WARN({
                label: "Server.js",
                service: "Exit",
                message: `Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`,
            });

            CLUSTER.fork();
        });

        CLUSTER.on(MESSAGE, (worker, message, handle) => {
            LOG_INFO({
                label: "Server.js",
                service: "Primary Worker Message",
                message: `Primary Worker received message from worker ${worker.process.pid}: ${message}`,
            });
        });

        const GracefullyShutdownWorkers = (signal, exitCode = 0) => {
            LOG_WARN({
                label: "Server.js",
                service: "GracefullyShutdownWorkers",
                message: `Primary Worker ${PROCESS.pid} received signal: ${signal}. Shutting Down...!`,
            });

            /* Iterate over all worker processes and send a shutdown message */
            Object.values(CLUSTER.workers).forEach((worker) => {
                if (worker.isConnected()) {
                    worker.send(SHUTDOWN);
                }
            });

            /* Wait for workers to shut down gracefully before exiting */
            setTimeout(() => {
                PROCESS.exit(exitCode);
            }, 10000);
        }

        PROCESS.on(UNHANDLED_REJECTION, (reason, promise) => {
            LOG_ERROR({
                label: "Server.js",
                service: "Unhandled Rejection",
                error: `Unhandled Rejection at: ${promise} reason: ${reason}`,
            });

            GracefullyShutdownWorkers(UNHANDLED_REJECTION, 1);
        });

        PROCESS.on(UNCAUGHT_EXCEPTION, (error) => {
            LOG_ERROR({
                label: "Server.js",
                service: "Uncaught Error",
                error: `Uncaught Exception: ${error}`,
            });

            GracefullyShutdownWorkers(UNCAUGHT_EXCEPTION, 1);
        });

        PROCESS.on(SIGTERM, () => {
            GracefullyShutdownWorkers(SIGTERM);
        });

        PROCESS.on(SIGINT, () => {
            GracefullyShutdownWorkers(SIGINT);
        });
    } else if (CLUSTER.isWorker) {
        PROCESS.on(MESSAGE, (message) => {
            try {
                if (message === ONLINE) {
                    CONNECT_DATABASE().then(() => {
                        START_SERVER();
                    }).catch((error) => {
                        LOG_ERROR({
                            label: "Server.js",
                            service: "Connection",
                            error: {
                                error: error.message,
                                message: `An error occured while connection to the Database`,
                            },
                        });
                    });
                }

                if (message === SHUTDOWN) {
                    LOG_INFO({
                        label: "Server.js",
                        service: "Shutdown Worker",
                        message: `Worker ${PROCESS.pid} has shut down...!`,
                    });
                    
                    PROCESS.exit(0);
                }
            } catch (error) {
                LOG_ERROR({
                    label: "Server.js",
                    service: "Message Catch",
                    error: error.message,
                });
            }
        });
    }
})();