import MONGOOSE, { Schema } from "mongoose";
import BCRYPT from "bcryptjs";
import JSON_WEB_TOKEN from "jsonwebtoken";
import {
    SAVE,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY
} from "../Utilities/Constants.js";
import { API_ERROR } from "../Utilities/ApiError.js";

const USER_SCHEMA = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required...!"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        fullName: {
            type: String,
            required: [true, "Name is required...!"],
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required...!"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone is required...!"],
            unique: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: [true, "Avatar is required...!"],
        },
        password: {
            type: String,
            required: [true, "Password is required...!"],
        },
        refreshToken: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

USER_SCHEMA.pre(SAVE, async function (Next) {
    if (!this.isModified("password")) return Next();

    const SaltRounds = 12;
    this.password = await BCRYPT.hash(this.password, SaltRounds);
    Next();
});

USER_SCHEMA.methods.isPasswordCorrect = async function (Password) {
    return await BCRYPT.compare(Password, this.password);
}

USER_SCHEMA.methods.GenerateAccessToken = async function () {
    return await JSON_WEB_TOKEN.sign(
        {
            _id: this._id,
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        },
    );
}

USER_SCHEMA.methods.GenerateRefreshToken = async function (AccessToken) {
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

    return await JSON_WEB_TOKEN.sign(
        {
            _id: this._id,
            accessToken: AccessToken
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        },
    );
}

export const USER = MONGOOSE.model("Users", USER_SCHEMA);