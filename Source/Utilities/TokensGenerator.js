import JSON_WEB_TOKEN from "jsonwebtoken";
import { API_ERROR } from "./ApiError.js";
import {
    ACTIVATION_TOKEN_SECRET,
    ACTIVATION_TOKEN_EXPIRY,
    AUTHENTICATION_TOKEN_SECRET,
    AUTHENTICATION_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
} from "./Constants.js";
import { EXTRACT_FROM_STRING } from "./HelperFunctions.js";

export const GENERATE_ACTIVATION_TOKEN = (Payload) => {
    try {
        return JSON_WEB_TOKEN.sign(
            Payload,
            ACTIVATION_TOKEN_SECRET,
            {
                expiresIn: ACTIVATION_TOKEN_EXPIRY
            },
        );
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const GENERATE_AUTHENTICATION_TOKEN = (ID) => {
    try {
        return JSON_WEB_TOKEN.sign(
            {
                _id: ID,
            },
            AUTHENTICATION_TOKEN_SECRET,
            {
                expiresIn: AUTHENTICATION_TOKEN_EXPIRY
            },
        );
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const GENERATE_ACCESS_TOKEN = (ID) => {
    try {
        return JSON_WEB_TOKEN.sign(
            {
                _id: ID,
            },
            ACCESS_TOKEN_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRY
            },
        );
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const GENERATE_REFRESH_TOKEN = (AccessToken, RefreshToken, ID) => {
    try {
        if (!AccessToken) {
            throw new API_ERROR(
                500,
                "Access Token not found...!",
                [
                    {
                        label: "User.Model.js",
                        message: "Access Token not found...!",
                    }
                ]
            );
        }

        const AccessTokens = [AccessToken];

        if (RefreshToken) {
            const Decoded = JSON_WEB_TOKEN.verify(RefreshToken, REFRESH_TOKEN_SECRET);
            if (Decoded.accessTokens.length > 0) {
                AccessTokens.push(Decoded.accessTokens);
            }
        }

        return JSON_WEB_TOKEN.sign(
            {
                _id: ID,
                accessTokens: AccessTokens
            },
            REFRESH_TOKEN_SECRET,
            {
                expiresIn: REFRESH_TOKEN_EXPIRY
            },
        );
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const EXTRACT_AND_VERIFY_ACCESS_TOKEN = (AuthorizationHeader) => {
    try {
        const ExtractedAuthorizationHeader = EXTRACT_FROM_STRING({
            ExtractBefore: ".",
            CountExtractBefore: 2,
            OriginalString: AuthorizationHeader,
            CharactersToExtractBefore: 24,
        });

        const Token = ExtractedAuthorizationHeader.UpdatedString;
        const DecodedToken = JSON_WEB_TOKEN.verify(Token, ACCESS_TOKEN_SECRET);

        return { DecodedToken, ExtractedAuthorizationHeader };
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const EXTRACT_ID_FROM_ACCESS_TOKEN = (AuthorizationHeader) => {
    try {
        const ExtractedAuthorizationHeader = EXTRACT_FROM_STRING({
            ExtractBefore: ".",
            CountExtractBefore: 2,
            OriginalString: AuthorizationHeader,
            CharactersToExtractBefore: 24,
        });

        return ExtractedAuthorizationHeader.StringBefore;
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}