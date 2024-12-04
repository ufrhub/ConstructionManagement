import { USER } from "../Models/User.Model.js";
import { INSERT_INTO_STRING } from "./HelperFunctions.js";
import { API_ERROR } from "./ApiError.js";

export const GENERATE_REFRESH_AND_ACCESS_TOKEN = async ({ User, _id, username, email }) => {
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
        
        if (username || email) {
            const AvailableUser = await USER.findOne({
                $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
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