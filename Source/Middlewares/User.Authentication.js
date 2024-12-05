import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { EXTRACT_AND_VERIFY_AUTHENTICATION_TOKEN } from "../Utilities/HelperFunctions.js";
import { USER } from "../Models/User.Model.js";
import { USER_TYPES } from "../Utilities/Constants.js";

export const AUTHENTICATE_USER_FOR_REGISTRATION = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        const RequestBody = Request.body;

        if (RequestBody.userType === USER_TYPES.ADMIN) {
            Request.User = RequestBody;
            return Next();
        };

        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_AUTHENTICATION_TOKEN(AuthorizationHeader);
        const User = await USER.findById(DecodedToken._id).lean({ virtuals: true }).select("userType createdBy");

        if (RequestBody.userType === USER_TYPES.CONTRACTER) {
            if (User.userType !== USER_TYPES.ADMIN) throw new API_ERROR(401, "Invalid Access Token...!");
        }

        if (RequestBody.userType === USER_TYPES.WORKER) {
            if (User.userType !== USER_TYPES.ADMIN && User.userType !== USER_TYPES.CONTRACTER) throw new API_ERROR(401, "Invalid Access Token...!");
        }

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const AUTHENTICATE_ADMIN = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_AUTHENTICATION_TOKEN(AuthorizationHeader);
        const User = await USER.findById(DecodedToken._id).lean({ virtuals: true }).select("-password -refreshToken");
        if (!User || User.userType !== USER_TYPES.ADMIN) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const AUTHENTICATE_CONTRACTER = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_AUTHENTICATION_TOKEN(AuthorizationHeader);
        const User = await USER.findById(DecodedToken._id).lean({ virtuals: true }).select("-password -refreshToken");
        if (!User || User.userType !== USER_TYPES.CONTRACTER) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const AUTHENTICATE_WORKER = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_AUTHENTICATION_TOKEN(AuthorizationHeader);
        const User = await USER.findById(DecodedToken._id).lean({ virtuals: true }).select("-password -refreshToken");
        if (!User || User.userType !== USER_TYPES.WORKER) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});