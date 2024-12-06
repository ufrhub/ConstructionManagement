import MONGOOSE, { Schema } from "mongoose";
import BCRYPT from "bcryptjs";
import JSON_WEB_TOKEN from "jsonwebtoken";
import {
    GENDERS,
    USER_TYPES,
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
        firstName: {
            type: String,
            required: [true, "First name is required...!"],
            index: true,
        },
        middleName: {
            type: String,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required...!"],
            index: true,
        },
        gender: {
            type: String,
            enum: Object.values(GENDERS),
        },
        birthDate: {
            type: Date,
        },
        email: {
            type: String,
            required: [true, "Email is required...!"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/, "Please enter a valid email address."],
        },
        phone: {
            type: String,
            required: [true, "Phone is required...!"], // Phone number is required
            unique: true,
            trim: true,
            match: [/^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/, "Please enter a valid phone number."],
        },
        address: {
            type: String,
        },
        avatar: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Password is required...!"],
        },
        userType: {
            type: Number,
            required: [true, "UserType is required...!"],
            enum: Object.values(USER_TYPES),
            default: 1,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: false,
        },
        refreshToken: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
        collection: "Users",
    }
);

USER_SCHEMA.virtual("fullName").get(function () {
    return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
});

USER_SCHEMA.set("toObject", { virtuals: true });
USER_SCHEMA.set("toJSON", { virtuals: true });

USER_SCHEMA.pre(SAVE, async function (Next) {
    if (!this.isModified("password")) return Next();
    if (this.userType !== 0 && !this.createdBy) {
        throw new API_ERROR(
            400,
            "CreatedBy is required if userType is not 0...!",
            [
                {
                    label: "User.Model.js",
                    message: "CreatedBy is required if userType is not 0...!",
                }
            ]
        );
    }

    try {
        const SaltRounds = 12;
        this.password = await BCRYPT.hash(this.password, SaltRounds);
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

USER_SCHEMA.methods.isPasswordCorrect = async function (Password) {
    try {
        return await BCRYPT.compare(Password, this.password);
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

USER_SCHEMA.methods.GenerateAccessToken = function () {
    try {
        return JSON_WEB_TOKEN.sign(
            {
                _id: this._id,
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

USER_SCHEMA.methods.GenerateRefreshToken = function (AccessToken) {
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

        return JSON_WEB_TOKEN.sign(
            {
                _id: this._id,
                accessToken: AccessToken
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

export const USER = MONGOOSE.model("Users", USER_SCHEMA);