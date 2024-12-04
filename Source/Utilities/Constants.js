import DOTENV from "dotenv";
import PATH from "node:path";
import URL from "node:url";
import PROCESS from "node:process";

const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

/* Server Constants */
export const ONLINE = "online";
export const FORK = "fork";
export const LISTENING = "listening";
export const CONNECT = "connect";
export const CONNECTION = "connection";
export const UNAUTHORIZED = "Unauthorized";
export const CLOSE = "close";
export const DISCONNECT = "disconnect";
export const EXIT = "exit";
export const ERROR = "errror";
export const MESSAGE = "message";
export const PING = "ping";
export const PONG = "pong";
export const SHUTDOWN = "shutdown";
export const UNHANDLED_REJECTION = "unhandledRejection";
export const UNCAUGHT_EXCEPTION = "uncaughtException";
export const DATABASE_CONNECTED = "DatabaseConnected";
export const SIGTERM = "SIGTERM";
export const SIGINT = "SIGINT";

/* Application Constants */
export const ALLOWED_ORIGINS = PROCESS.env.CORS_ORIGINS ? PROCESS.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
export const METHODS = PROCESS.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE";
export const ALLOWED_HEADERS = PROCESS.env.CORS_ALLOWED_HEADERS || "Content-Type, Authorization";
export const CREDENTIALS = PROCESS.env.CORS_CREDENTIALS === "true";
export const PREF_LIGHT_CONTINUE = PROCESS.env.CORS_PREFLIGHT_CONTINUE === "true";
export const OPTIONS_SUCCESS_STATUS = parseInt(PROCESS.env.CORS_OPTION_SUCCESS_STATUS) || 200;
export const PORT = PROCESS.env.PORT || 7000;

/* Mongoose Constants */
export const MONGODB_URI = PROCESS.env.MongoDB_URI || null;
export const DATABASE_NAME = PROCESS.env.DATABASE_NAME || "ConstructionManagement";
export const SAVE = "save";
