import { API_ERROR } from "./ApiError.js";

const ASYNCHRONOUS_HANDLER = (RequestHandler) => async (Request, Response, Next) => {
    try {
        await RequestHandler(Request, Response, Next);
    } catch (error) {
        throw new API_ERROR(error?.statusCode || 500, error?.message, [error], error?.stack);
    }
}

export { ASYNCHRONOUS_HANDLER };