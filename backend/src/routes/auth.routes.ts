import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/users.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(validate(registerSchema), registerUser);
router.route("/login").post(validate(loginSchema), loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/refresh-access-token').post( refreshAccessToken);

export default router;