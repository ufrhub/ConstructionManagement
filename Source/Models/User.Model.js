import MONGOOSE, { Schema } from "mongoose";
import BCRYPT from "bcryptjs";
import {
    GENDERS,
    USER_TYPES,
    SAVE,
    LOGIN_STATUS,
} from "../Utilities/Constants.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { GENERATE_ACCESS_TOKEN, GENERATE_REFRESH_TOKEN } from "../Utilities/TokensGenerator.js";

const LOGIN_INFORMATION_SCHEMA = new Schema(
    {
        time: {
            type: String,
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        device: {
            type: String,
            required: true,
        },
        currentStatus: {
            type: Number,
            required: true,
            enum: Object.values(LOGIN_STATUS),
        }
    },
    { _id: false }
);

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
            required: false,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required...!"],
            index: true,
        },
        gender: {
            type: String,
            required: false,
            enum: Object.values(GENDERS),
        },
        birthDate: {
            type: Date,
            required: false,
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
            required: false,
        },
        avatar: {
            type: String,
            required: false,
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
        loginInfo: {
            type: [LOGIN_INFORMATION_SCHEMA],
            required: false,
            default: [],
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
    if (!this.isModified("password") && !this.isNew) return Next();

    try {
        const SaltRounds = 12;
        const HashedPassword = await BCRYPT.hash(this.password, SaltRounds);
        this.password = HashedPassword;
        Next();
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

USER_SCHEMA.methods.IS_PASSWORD_CORRECT = async function (Password) {
    try {
        return await BCRYPT.compare(Password, this.password);
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

USER_SCHEMA.methods.GENERATE_ACCESS_AND_REFRESH_TOKEN = function () {
    try {
        const AccessToken = GENERATE_ACCESS_TOKEN(this._id);
        const RefreshToken = GENERATE_REFRESH_TOKEN(AccessToken, this.refreshToken, this._id);
        this.refreshToken = RefreshToken;
        return AccessToken;
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
}

export const USER_SCHEMA_MODEL = MONGOOSE.model("Users", USER_SCHEMA);