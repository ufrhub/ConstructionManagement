import JSON_WEB_TOKEN from "jsonwebtoken";
import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER_SCHEMA_MODEL } from "../Models/User.Model.js";
import { USER_TYPES, ACTIVATION_TOKEN_SECRET, AUTHENTICATION_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../Utilities/Constants.js";
import { EXTRACT_AND_VERIFY_ACCESS_TOKEN, EXTRACT_ID_FROM_ACCESS_TOKEN } from "../Utilities/TokensGenerator.js";
import { INSERT_INTO_STRING } from "../Utilities/HelperFunctions.js";

export const VERIFY_ACTIVATION_TOKEN = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.activationToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = JSON_WEB_TOKEN.verify(AuthorizationHeader, ACTIVATION_TOKEN_SECRET);
        if (!DecodedToken) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = DecodedToken;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_AUTHENTICATION_TOKEN = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.authenticationToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = JSON_WEB_TOKEN.verify(AuthorizationHeader, AUTHENTICATION_TOKEN_SECRET);
        const User = await USER_SCHEMA_MODEL.findById(DecodedToken._id).lean({ virtuals: true }).select("-password -refreshToken");
        if (!User) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_ACCESS_TOKEN = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        const DecodedToken = EXTRACT_AND_VERIFY_ACCESS_TOKEN(AuthorizationHeader);
        const User = await USER_SCHEMA_MODEL.findById(DecodedToken._id).select("-password -refreshToken");
        if (!User) throw new API_ERROR(401, "Invalid Access Token...!");

        Request.User = User;
        Next();
    } catch (error) {
        if (error.message.includes("jwt expired")) {
            Request.expiredAccessToken = AuthorizationHeader;
            return Next();
        }

        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_REFRESH_TOKEN = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const AuthorizationHeader = Request.expiredAccessToken;
        if (!AuthorizationHeader) return Next();

        const ID = EXTRACT_ID_FROM_ACCESS_TOKEN(AuthorizationHeader);
        const User = await USER_SCHEMA_MODEL.findById(ID).select("-password -refreshToken");
        if (!User) throw new API_ERROR(401, "Invalid Access Token...!");

        const Token = await User.GENERATE_ACCESS_AND_REFRESH_TOKEN();
        const AccessToken = INSERT_INTO_STRING({
            InsertBefore: ".",
            CountInsertBefore: 2,
            OriginalString: Token,
            InsertStringBefore: User._id,
        });

        Request.User = User;
        Request.Token = AccessToken;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_ADMIN_ROLE = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const userType = Request.User?.userType || Request.body?.userType;
        if (isNaN(userType)) throw new API_ERROR(401, "Unauthorized request...!");
        if (userType !== USER_TYPES.ADMIN) throw new API_ERROR(403, "Access Denied...!");
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_CONTRACTER_ROLE = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const userType = Request.User?.userType || Request.body?.userType;
        if (isNaN(userType)) throw new API_ERROR(401, "Unauthorized request...!");
        if (userType !== USER_TYPES.CONTRACTER) throw new API_ERROR(403, "Access Denied...!");
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VERIFY_WORKER_ROLE = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        const userType = Request.User?.userType || Request.body?.userType;
        if (isNaN(userType)) throw new API_ERROR(401, "Unauthorized request...!");
        if (userType !== USER_TYPES.WORKER) throw new API_ERROR(403, "Access Denied...!");
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});