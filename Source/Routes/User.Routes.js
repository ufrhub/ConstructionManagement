import EXPRESS from "express";
import {
    REGISTER_NEW_USER,
    ACTIVATE_NEW_USER,
    LOGIN_USER,
    // LOGOUT_USER
} from "../Controllers/User.Controller.js";
import { UPLOAD } from "../Middlewares/Multer.Middleware.js";
import { AUTHENTICATE_USER_FOR_REGISTRATION } from "../Middlewares/User.Authentication.js"
import { VERIFY_USER_ACTIVATION } from "../Middlewares/User.Activation.js";

const ROUTER = EXPRESS.Router();

ROUTER.route("/register").post(AUTHENTICATE_USER_FOR_REGISTRATION, REGISTER_NEW_USER);
ROUTER.route("/activate").post(VERIFY_USER_ACTIVATION, ACTIVATE_NEW_USER);
ROUTER.route("/login").post(LOGIN_USER);
// ROUTER.route("/logout").post(AUTHENTICATE_USER, LOGOUT_USER);

export default ROUTER;