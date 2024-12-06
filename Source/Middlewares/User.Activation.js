import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { EXTRACT_AND_VERIFY_ACTIVATION_TOKEN } from "../Utilities/HelperFunctions.js";
import { USER } from "../Models/User.Model.js";
import { USER_TYPES } from "../Utilities/Constants.js";

export const VERIFY_USER_ACTIVATION = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.activationToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_ACTIVATION_TOKEN(AuthorizationHeader);

        Request.User = DecodedToken;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});