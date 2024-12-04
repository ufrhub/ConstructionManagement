import WINSTON from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, label, json, colorize, prettyPrint, ms, align } = WINSTON.format;

const LOGGER = (Label = "", Service = "") => {
    const formats = [timestamp(), json()];

    if (Label) {
        formats.unshift(label({ label: Label }));
    }

    return WINSTON.createLogger({
        level: 'debug',
        format: combine(...formats,
            colorize(),
            prettyPrint(),
            ms(),
        ),
        defaultMeta: Service ? { service: Service } : {},
        exitOnError: false,
        silent: false,
        transports: [
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-error.log',
                level: 'error',
                format: json(),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }),
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-warn.log',
                level: 'warn',
                format: json(),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }),
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-info.log',
                level: 'info',
                format: json(),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }),
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-debug.log',
                level: 'debug',
                format: json(),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }),
            new WINSTON.transports.Console({
                handleExceptions: true,
                level: 'debug',
                format: combine(
                    colorize(),
                    json(),
                    prettyPrint(),
                    align(),
                ),
            }),
        ],
        exceptionHandlers: [
            new WINSTON.transports.File({ filename: './Logs/exceptions.log' })
        ],
        rejectionHandlers: [
            new WINSTON.transports.File({ filename: './Logs/rejections.log' })
        ],
    });
};

const LOG_ERROR = ({ label = "", service = "", error = "" }) => {
    const logger = LOGGER(label, service);
    logger.error(error);
}

const LOG_WARN = ({ label = "", service = "", message = "" }) => {
    const logger = LOGGER(label, service);
    logger.warn(message);
}

const LOG_INFO = ({ label = "", service = "", message = "" }) => {
    const logger = LOGGER(label, service);
    logger.info(message);
}

const LOG_DEBUG = ({ label = "", service = "", message = "" }) => {
    const logger = LOGGER(label, service);
    logger.debug(message);
}

export { LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG };