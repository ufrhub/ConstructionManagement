import JSON_WEB_TOKEN from "jsonwebtoken";
import { USER } from "../Models/User.Model.js";
import { ACCESS_TOKEN_SECRET, ACTIVATION_TOKEN_SECRET, AUTHENTICATION_TOKEN_SECRET } from "./Constants.js";
import { API_ERROR } from "./ApiError.js";

export const GENERATE_UNIQUE_USERNAME = async (firstName, lastName) => {
    try {
        if (!firstName || !lastName) {
            throw new API_ERROR(500, "First name and last name are required to generate a username.");
        }

        const RandomDigits = Math.floor(100 + Math.random() * 900);
        const BaseUsername = `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}${RandomDigits}`;

        const MatchingUsers = await USER.where("username")
            .regex(new RegExp(`^${BaseUsername}`, "i"))
            .select("username")
            .lean();

        const ExistingUsernames = new Set(MatchingUsers.map(user => user.username.toLowerCase()));

        if (!ExistingUsernames.has(BaseUsername)) {
            return BaseUsername;
        }

        let Counter = 1;
        let NewUsername = `${BaseUsername}${Counter}`;
        while (ExistingUsernames.has(NewUsername.toLowerCase())) {
            Counter++;
            NewUsername = `${BaseUsername}${Counter}`;
        }

        return NewUsername;
    } catch (error) {
        throw new API_ERROR(500, `Failed to generate a unique username: ${error.message}`);
    }
};

export const GENERATE_OTP = (Digits = 6) => {
    if (Digits <= 0) throw new API_ERROR(500, "Digits must be a positive number.");

    const Minimum = Math.pow(10, Digits - 1);
    const Maximum = Math.pow(10, Digits) - 1;
    const OTP = Math.floor(Math.random() * (Maximum - Minimum + 1)) + Minimum;

    return OTP.toString();
}

export const INSERT_INTO_STRING = ({
    InsertBefore = "",
    CountInsertBefore = 1,
    InsertAfter = "",
    CountInsertAfter = 1,
    OriginalString = "",
    InsertStringBefore = "",
    InsertStringAfter = "",
}) => {
    if ((!InsertBefore && !InsertAfter) || !OriginalString || (!InsertStringBefore && !InsertStringAfter)) return;

    let UpdatedString = OriginalString;
    let BeforeCount = CountInsertBefore > 0 ? 0 : 2;
    let AfterCount = CountInsertAfter > 0 ? 0 : 2;

    for (let i = 0; i < UpdatedString.length; ++i) {
        if (UpdatedString[i] === InsertBefore && BeforeCount < CountInsertBefore) ++BeforeCount;

        if (UpdatedString[i] === InsertAfter && AfterCount < CountInsertAfter) ++AfterCount;

        if (UpdatedString[i] === InsertBefore && BeforeCount === CountInsertBefore) {
            UpdatedString = UpdatedString.slice(0, i) + InsertStringBefore + UpdatedString.slice(i);
            i += InsertStringBefore.length;
            ++BeforeCount;
        }

        if (UpdatedString[i] === InsertAfter && AfterCount === CountInsertAfter) {
            UpdatedString = UpdatedString.slice(0, i + 1) + InsertStringAfter + UpdatedString.slice(i + 1);
            i += InsertStringAfter.length;
            ++AfterCount;
        }

        if (BeforeCount > CountInsertBefore && AfterCount > CountInsertAfter) break;
    }

    return UpdatedString;
}

export const EXTRACT_FROM_STRING = ({
    ExtractBefore = "",
    CountExtractBefore = 1,
    ExtractAfter = "",
    CountExtractAfter = 1,
    OriginalString = "",
    CharactersToExtractBefore = 0,
    CharactersToExtractAfter = 0,
}) => {
    if ((!ExtractBefore && !ExtractAfter) || !OriginalString) return null;

    let UpdatedString = OriginalString;
    let StringBefore = "";
    let StringAfter = "";
    let StringBeforeIndex = -1;
    let StringAfterIndex = -1;
    let BeforeCount = CountExtractBefore > 0 ? 0 : 2;
    let AfterCount = CountExtractAfter > 0 ? 0 : 2;

    for (let i = 0; i < OriginalString.length; ++i) {
        if (OriginalString[i] === ExtractBefore && BeforeCount < CountExtractBefore) ++BeforeCount;

        if (OriginalString[i] === ExtractAfter && AfterCount < CountExtractAfter) ++AfterCount;

        if (OriginalString[i] === ExtractBefore && BeforeCount === CountExtractBefore) {
            StringBeforeIndex = i;
            ++BeforeCount;
        }

        if (OriginalString[i] === ExtractAfter && AfterCount === CountExtractAfter) {
            StringAfterIndex = i;
            ++AfterCount;
        }

        if (BeforeCount > CountExtractBefore && AfterCount > CountExtractAfter) {
            break;
        }
    }

    StringBefore = StringBeforeIndex >= 0 ? OriginalString.substring(StringBeforeIndex - CharactersToExtractBefore, StringBeforeIndex) : "";
    StringAfter = StringAfterIndex >= 0 ? OriginalString.substring(StringAfterIndex + CharactersToExtractAfter + 1, StringAfterIndex + 1) : "";

    if (StringBeforeIndex < StringAfterIndex || StringBeforeIndex === StringAfterIndex) {
        UpdatedString = UpdatedString.slice(0, StringBeforeIndex - CharactersToExtractBefore) + UpdatedString.slice(StringBeforeIndex);
        StringAfterIndex -= CharactersToExtractBefore;
        UpdatedString = UpdatedString.slice(0, StringAfterIndex + 1) + UpdatedString.slice(StringAfterIndex + CharactersToExtractAfter + 1);

        return { StringBefore, StringAfter, UpdatedString };
    }

    if (StringBeforeIndex > StringAfterIndex) {
        UpdatedString = UpdatedString.slice(0, StringAfterIndex + 1) + UpdatedString.slice(StringAfterIndex + CharactersToExtractAfter + 1);
        StringBeforeIndex -= CharactersToExtractAfter;
        UpdatedString = UpdatedString.slice(0, StringBeforeIndex - CharactersToExtractBefore) + UpdatedString.slice(StringBeforeIndex);

        return { StringBefore, StringAfter, UpdatedString };
    }

    return { StringBefore, StringAfter, UpdatedString };
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

        return DecodedToken;
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const EXTRACT_AND_VERIFY_ACTIVATION_TOKEN = (AuthorizationHeader) => {
    try {
        const ExtractedAuthorizationHeader = EXTRACT_FROM_STRING({
            ExtractBefore: ".",
            CountExtractBefore: 2,
            OriginalString: AuthorizationHeader,
            CharactersToExtractBefore: 24,
        });

        const Token = ExtractedAuthorizationHeader.UpdatedString;
        const DecodedToken = JSON_WEB_TOKEN.verify(Token, ACTIVATION_TOKEN_SECRET);

        return DecodedToken;
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const EXTRACT_AND_VERIFY_AUTHENTICATION_TOKEN = (AuthorizationHeader) => {
    try {
        const ExtractedAuthorizationHeader = EXTRACT_FROM_STRING({
            ExtractBefore: ".",
            CountExtractBefore: 2,
            OriginalString: AuthorizationHeader,
            CharactersToExtractBefore: 24,
        });

        const Token = ExtractedAuthorizationHeader.UpdatedString;
        const DecodedToken = JSON_WEB_TOKEN.verify(Token, AUTHENTICATION_TOKEN_SECRET);

        return DecodedToken;
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}