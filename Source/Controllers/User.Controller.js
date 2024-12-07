import Bcrypt from "bcryptjs";
import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER } from "../Models/User.Model.js";
import { GENERATE_UNIQUE_USERNAME, GENERATE_OTP } from "../Utilities/HelperFunctions.js";
import { UPLOAD_FILE_ON_CLOUDINARY } from "../Utilities/Cloudinary.js";
import { API_RESPONSE } from "../Utilities/ApiResponse.js";
import { GENERATE_REFRESH_AND_ACCESS_TOKEN, GENERATE_ACTIVATION_TOKEN } from "../Utilities/TokensGenerator.js";
import { SALT_ROUNDS } from "../Utilities/Constants.js";
import { EMAIL_VERIFICATION_TEMPLATE } from "../Utilities/EmailTemplates.js";
import { SEND_EMAIL } from "../Utilities/SendEmail.js";

const CookieOptions = {
    httpOnly: true,
    secure: true
}

export const REGISTER_NEW_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password,
            userType,
            createdBy
        } = Request.User;

        if (
            [firstName, lastName, email, phone, password, userType.toString()].some((field) => {
                field?.trim() === ""
            })
        ) {
            throw new API_ERROR(400, "All fields are required...!");
        }

        const ExistingUser = await USER.findOne({
            $or: [{ email: email.toLowerCase() }, { phone: phone.toLowerCase() }]
        }).lean().select("_id username");

        if (ExistingUser) throw new API_ERROR(400, "User with this email or phone already exist...!");

        const UniqueUsername = await GENERATE_UNIQUE_USERNAME(firstName, lastName);
        const OTP = GENERATE_OTP(6);
        const EmailVerificationCode = await Bcrypt.hash(OTP, SALT_ROUNDS);
        const NewUser = {
            username: UniqueUsername,
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password,
            userType,
            createdBy,
            VerificationCode: EmailVerificationCode
        }
        const ActivationToken = GENERATE_ACTIVATION_TOKEN(NewUser);
        const EmailTemplate = EMAIL_VERIFICATION_TEMPLATE(OTP);

        SEND_EMAIL(
            {
                To: email,
                EmailBody: EmailTemplate,
            }
        );

        return Response.status(200)
            .cookie("activationToken", ActivationToken, CookieOptions)
            .json(
                new API_RESPONSE(200,
                    {
                        token: ActivationToken
                    },
                    "Verification Email Sent. Verify Your Email...!...!"
                )
            );
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const ACTIVATE_NEW_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    try {
        const DecodedUserData = Request.User;
        const { EmailVerificationCode } = Request.body;

        const {
            username,
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password,
            userType,
            createdBy,
            VerificationCode
        } = DecodedUserData;

        const ExistingUser = await USER.findOne({
            $or: [{ email: email.toLowerCase() }, { phone: phone.toLowerCase() }]
        }).lean().select("_id username");

        if (ExistingUser) throw new API_ERROR(400, "User already registered...!");

        const isVerificationCodeMatched = await Bcrypt.compare(EmailVerificationCode, VerificationCode);

        if (!isVerificationCodeMatched) throw new API_ERROR(400, "Incorrect Verification Code...!");

        const CreatedUser = await USER.create({
            username,
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password,
            userType: parseInt(userType),
            createdBy: createdBy !== "" ? createdBy : null,
        });

        if (!CreatedUser) throw new API_ERROR(500, "Something went wrong while registering new User...!");

        return Response.status(201)
            .clearCookie("activationToken", CookieOptions)
            .json(
                new API_RESPONSE(
                    200,
                    CreatedUser._id,
                    "User registered successfully...!"
                )
            );
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const LOGIN_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    try {
        const { username, email, password } = Request.body;

        if (!username && !email) throw new API_ERROR(400, "Username or email required...!");
        if (!password) throw new API_ERROR(400, "Password required...!");

        const User = await USER.findOne({
            $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
        });

        if (!User) throw new API_ERROR(404, "User does not exist with this username or email...!");

        const isPasswordMatched = await User.isPasswordCorrect(password);

        if (!isPasswordMatched) throw new API_ERROR(400, "Incorrect password...!");

        const { AccessToken } = await GENERATE_REFRESH_AND_ACCESS_TOKEN({ User });
        const UserData = {
            _id: User._id,
            username: User.username,
            firstName: User.firstName,
            middleName: User.middleName,
            lastName: User.lastName,
            fullName: User.fullName,
            gender: User.gender,
            birthDate: User.birthDate,
            email: User.email,
            phone: User.phone,
            avatar: User.avatar,
            address: User.address,
            userType: User.userType,
            createdBy: User.createdBy,
            accessToken: AccessToken,
        }

        return Response.status(200)
            .cookie("accessToken", AccessToken, CookieOptions)
            .json(
                new API_RESPONSE(
                    200,
                    {
                        user: UserData,
                    },
                    "User logged in Successfully...!"
                )
            );
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const GET_ALL_WORKERS = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    try {
        const { createdBy } = Request.params;
        const ObjectID = MONGOOSE.Types.ObjectId(createdBy); // Ensure valid ObjectId

        const Workers = await USER.find({ createdBy: ObjectID })
            .lean({ virtuals: true })
            .select("-password")
            .populate("createdBy", "username fullName");

        if (Workers.length > 0) {
            return Response.status(200).json(
                new API_RESPONSE(200, Workers, "Workers fetched successfully...!")
            );
        }

        throw new API_ERROR(400, "No workers found...!");
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});