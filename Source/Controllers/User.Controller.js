import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER } from "../Models/User.Model.js";
import { GENERATE_UNIQUE_USERNAME, GENERATE_OTP } from "../Utilities/HelperFunctions.js";
import { UPLOAD_FILE_ON_CLOUDINARY } from "../Utilities/Cloudinary.js";
import { API_RESPONSE } from "../Utilities/ApiResponse.js";
import { GENERATE_REFRESH_AND_ACCESS_TOKEN } from "../Utilities/TokensGenerator.js";

const CookieOptions = {
    httpOnly: true,
    secure: true
}

export const REGISTER_NEW_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    try {
        const {
            username,
            firstName,
            middleName,
            lastName,
            gender,
            birthDate,
            email,
            phone,
            address,
            password,
            userType,
            createdBy,
        } = Request.User;

        if (
            [username, firstName, lastName, email, phone, password, userType].some((field) => {
                field?.trim() === ""
            })
        ) {
            throw new API_ERROR(400, "All fields are required...!");
        }

        const ExistingUser = await USER.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }, { phone: phone.toLowerCase() }]
        });

        if (ExistingUser) throw new API_ERROR(400, "User already exist...!");

        const EmailVerificationCode = GENERATE_OTP(6);
        
    } catch (error) {
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});

export const VALIDATE_AND_CREATE_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {

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