class API_ERROR extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong...!",
        errors = [],
        stack = ""
    ) {
        super(message);

        this.name = "APIError";
        this.statusCode = statusCode;
        this.success = false;
        this.data = null;
        this.message = message;
        this.errors = errors.length > 0 ? errors : [{ message: message }];

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { API_ERROR };