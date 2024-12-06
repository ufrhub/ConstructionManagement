import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { EXTRACT_AND_VERIFY_ACCESS_TOKEN } from "../Utilities/HelperFunctions.js";
import { USER } from "../Models/User.Model.js";
import { USER_TYPES } from "../Utilities/Constants.js";

export const VERIFY_ADMIN_ACCESSIBILITY = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_ACCESS_TOKEN(AuthorizationHeader);
        const User = await USER.findById(DecodedToken._id).lean({ virtuals: true }).select("-password -refreshToken");
        if (!User || User.userType !== USER_TYPES.ADMIN) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_CONTRACTER_ACCESSIBILITY = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_ACCESS_TOKEN(AuthorizationHeader);
        const User = await USER.findById(DecodedToken._id).lean({ virtuals: true }).select("-password -refreshToken");
        if (!User || User.userType !== USER_TYPES.CONTRACTER) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_WORKER_ACCESSIBILITY = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_ACCESS_TOKEN(AuthorizationHeader);
        const User = await USER.findById(DecodedToken._id).lean({ virtuals: true }).select("-password -refreshToken");
        if (!User || User.userType !== USER_TYPES.WORKER) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});