import JSON_WEB_TOKEN from "jsonwebtoken";
import { USER } from "../Models/User.Model.js";
import { INSERT_INTO_STRING } from "./HelperFunctions.js";
import { API_ERROR } from "./ApiError.js";
import {
    ACTIVATION_TOKEN_SECRET,
    ACTIVATION_TOKEN_EXPIRY,
    AUTHENTICATION_TOKEN_SECRET,
    AUTHENTICATION_TOKEN_EXPIRY
} from "./Constants.js";

export const GENERATE_REFRESH_AND_ACCESS_TOKEN = async ({ User, _id, username, email, phone }) => {
    try {
        if (User) {
            const AccessToken = await User.GenerateAccessToken();
            const RefreshToken = await User.GenerateRefreshToken(AccessToken);

            User.refreshToken = RefreshToken;

            await User.save({ validateBeforeSave: false });

            const UpdatedAccessToken = INSERT_INTO_STRING({
                InsertBefore: ".",
                CountInsertBefore: 2,
                OriginalString: AccessToken,
                InsertStringBefore: User._id,
            });

            return { AccessToken: UpdatedAccessToken, RefreshToken };
        }

        if (_id) {
            const AvailableUser = await USER.findById(_id);

            if (!AvailableUser) {
                throw new API_ERROR(500, "User does not exist with this _id...!");
            }

            const AccessToken = await AvailableUser.GenerateAccessToken();
            const RefreshToken = await AvailableUser.GenerateRefreshToken(AccessToken);

            AvailableUser.refreshToken = RefreshToken;

            await AvailableUser.save({ validateBeforeSave: false });

            const UpdatedAccessToken = INSERT_INTO_STRING({
                InsertBefore: ".",
                CountInsertBefore: 2,
                OriginalString: AccessToken,
                InsertStringBefore: _id,
            });

            return { AccessToken: UpdatedAccessToken, RefreshToken };
        }

        if (username || email || phone) {
            const AvailableUser = await USER.findOne({
                $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }, { phone: phone }]
            });

            if (!AvailableUser) {
                throw new API_ERROR(500, "User does not exist with this username or email...!");
            }

            const AccessToken = await AvailableUser.GenerateAccessToken();
            const RefreshToken = await AvailableUser.GenerateRefreshToken(AccessToken);

            AvailableUser.refreshToken = RefreshToken;

            await AvailableUser.save({ validateBeforeSave: false });

            const UpdatedAccessToken = INSERT_INTO_STRING({
                InsertBefore: ".",
                CountInsertBefore: 2,
                OriginalString: AccessToken,
                InsertStringBefore: AvailableUser._id,
            });

            return { AccessToken: UpdatedAccessToken, RefreshToken };
        }

        return null;
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error.stack);
    }
}

export const GENERATE_ACTIVATION_TOKEN = (Payload) => {
    const ActivationToken = JSON_WEB_TOKEN.sign(
        Payload,
        ACTIVATION_TOKEN_SECRET,
        {
            expiresIn: ACTIVATION_TOKEN_EXPIRY
        },
    );

    return ActivationToken;
}

export const GENERATE_AUTHENTICATION_TOKEN = (ID) => {
    const AuthenticationToken = JSON_WEB_TOKEN.sign(
        {
            _id: ID,
        },
        AUTHENTICATION_TOKEN_SECRET,
        {
            expiresIn: AUTHENTICATION_TOKEN_EXPIRY
        },
    );

    return AuthenticationToken;
}