class API_RESPONSE {
    constructor(statusCode, data, message = "Success...!") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { API_RESPONSE };