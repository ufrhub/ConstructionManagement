import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER } from "../Models/User.Model.js";
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
            email,
            fullName,
            password,
        } = Request.body;

        if (
            [username, email, fullName, password,].some((field) => {
                field?.trim() === ""
            })
        ) {
            throw new API_ERROR(400, "All fields are required...!");
        }

        const ExistingUser = await USER.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
        });

        if (ExistingUser) throw new API_ERROR(400, "User already exist...!");

        let AvatarLocalPath;
        let CoverImageLocalPath;

        if (Request.files) {
            if (Array.isArray(Request.files.avatar) && Request.files.avatar.length > 0)
                AvatarLocalPath = Request.files.avatar[0].path;

            if (Array.isArray(Request.files.coverImage) && Request.files.coverImage.length > 0)
                CoverImageLocalPath = Request.files.coverImage[0].path;
        }

        if (!AvatarLocalPath) throw new API_ERROR(404, "Avatar file is required...!");

        const UploadAvatarOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(AvatarLocalPath);
        const UploadCoverImageOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(CoverImageLocalPath);

        if (!UploadAvatarOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading avatar...!");
        if (!UploadCoverImageOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading coverImage...!");

        const CreatedUser = await USER.create({
            username: username.toLowerCase(),
            email,
            fullName,
            password,
            avatar: UploadAvatarOnCloudinary.url,
            coverImage: UploadCoverImageOnCloudinary?.url || "",
        });

        if (!CreatedUser) throw new API_ERROR(500, "Something went wrong while registering new User...!");

        return Response.status(201).json(
            new API_RESPONSE(200, CreatedUser._id, "User registered successfully...!")
        );
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