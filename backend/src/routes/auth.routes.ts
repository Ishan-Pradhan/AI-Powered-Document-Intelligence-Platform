import { Router } from "express";
import { registerUser } from "../controllers/users.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema } from "../validations/auth.validation";

const router = Router();

router.route("/register").post(validate(registerSchema), registerUser);

export default router;