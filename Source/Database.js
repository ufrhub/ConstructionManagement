import MONGOOSE from "mongoose";
import PROCESS from "node:process";

import { MONGODB_URI, DATABASE_NAME } from "./Utilities/Constants.js";
import { LOG_ERROR, LOG_INFO } from "./Utilities/WinstonLogger.js";

let isConnected = false;

const CONNECT_DATABASE = async () => {
    if (isConnected) {
        console.log("Already connected to MongoDB");
        LOG_INFO({
            label: "Database.js",
            service: "isConnected",
            message: `Already connected to MongoDB`
        });

        return;
    }

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is not set");
    }

    try {
        const CONNECTION_INSTANCE = await MONGOOSE.connect(`${MONGODB_URI}/${DATABASE_NAME}`, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 60000,
        });
        isConnected = true;

        LOG_INFO({
            label: "Database.js",
            service: "Mongoose Connect",
            message: {
                MESSAGE: `MongoDB Database Connected...!`,
                DATABASE_HOST: CONNECTION_INSTANCE.connection.host,
            }
        });
    } catch (error) {
        LOG_ERROR({
            label: "Database.js",
            service: "Mongoose Connect catch",
            error: `MongoDB connection error: ${error}`
        });

        isConnected = false;
        PROCESS.exit(1)
    }
}

const CLOSE_DATABASE_CONNECTION = async () => {
    try {
        if (!isConnected) {
            LOG_INFO({
                label: "Database.js",
                service: "Close Database Connection try",
                message: "No active MongoDB connection to close."
            });

            return;
        }

        // Attempt to close the Mongoose connection
        await MONGOOSE.connection.close();

        // Update the connection state
        isConnected = false;

        // Log successful closure
        LOG_INFO({
            label: "Database.js",
            service: "Close Database Connection try",
            message: "MongoDB connection closed successfully."
        });
    } catch (error) {
        LOG_ERROR({
            label: "Database.js",
            service: "Close Database Connection catch",
            error: `MongoDB connection error: ${error}`
        });

        PROCESS.exit(1)
    }
}

export { CONNECT_DATABASE, CLOSE_DATABASE_CONNECTION };