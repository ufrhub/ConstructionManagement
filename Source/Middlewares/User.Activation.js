import JSON_WEB_TOKEN from "jsonwebtoken";
import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { ACTIVATION_TOKEN_SECRET } from "../Utilities/Constants.js";

export const VERIFY_USER_ACTIVATION = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.activationToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = JSON_WEB_TOKEN.verify(AuthorizationHeader, ACTIVATION_TOKEN_SECRET);

        Request.User = DecodedToken;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});