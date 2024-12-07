import EXPRESS from "express";
import {
    REGISTER_NEW_USER,
    ACTIVATE_NEW_USER,
    LOGIN_USER,
    // LOGOUT_USER
} from "../Controllers/User.Controller.js";
import { UPLOAD } from "../Middlewares/Multer.Middleware.js";
import {
    VERIFY_ACTIVATION_TOKEN,
    VERIFY_AUTHENTICATION_TOKEN,
    VERIFY_ACCESS_TOKEN,
    VERIFY_REFRESH_TOKEN,
    VERIFY_ADMIN_ROLE,
    VERIFY_CONTRACTER_ROLE,
    VERIFY_WORKER_ROLE
} from "../Middlewares/User.Authentication.js"

const ROUTER = EXPRESS.Router();

ROUTER.route("/admin/register").post(VERIFY_ADMIN_ROLE, REGISTER_NEW_USER);
ROUTER.route("/contracter/register").post(VERIFY_AUTHENTICATION_TOKEN, VERIFY_CONTRACTER_ROLE, REGISTER_NEW_USER);
ROUTER.route("/worker/register").post(VERIFY_AUTHENTICATION_TOKEN, VERIFY_WORKER_ROLE, REGISTER_NEW_USER);
ROUTER.route("/activate").post(VERIFY_ACTIVATION_TOKEN, ACTIVATE_NEW_USER);
ROUTER.route("/login").post(LOGIN_USER);
// ROUTER.route("/logout").post(AUTHENTICATE_USER, LOGOUT_USER);

export default ROUTER;