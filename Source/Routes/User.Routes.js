import EXPRESS from "express";
import {
    REGISTER_NEW_USER,
    // LOGIN_USER,
    // LOGOUT_USER
} from "../Controllers/User.Controller.js";
import { UPLOAD } from "../Middlewares/Multer.Middleware.js";
// import { AUTHENTICATE_USER } from "../Middlewares/Authentication.Middleware.js"

const ROUTER = EXPRESS.Router();

ROUTER.route("/register").post(
    UPLOAD.fields([
        {
            name: "avatar", // name should be same as in User.Model schema.
            maxCount: 1
        }
    ]),
    REGISTER_NEW_USER
);
// ROUTER.route("/login").post(LOGIN_USER);
// ROUTER.route("/logout").post(AUTHENTICATE_USER, LOGOUT_USER);

export default ROUTER;