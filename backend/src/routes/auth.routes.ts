import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/users.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.route("/register").post(validate(registerSchema), registerUser);
router.route("/login").post(validate(loginSchema), loginUser);
router.route('/logout').post(logoutUser);

export default router;