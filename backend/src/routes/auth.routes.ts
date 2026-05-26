import { Router } from "express";
import { getCurrentUser, googleAuthCallback, googleAuthRedirect, loginUser, logoutUser, refreshAccessToken, registerUser, resendVerificationEmail, verifyEmail } from "../controllers/users.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema, resendVerificationEmailSchema, verifyEmailSchema } from "../validations/auth.validation";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(validate(registerSchema), registerUser);
router.route("/login").post(validate(loginSchema), loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/refresh-access-token').post( refreshAccessToken);
router.route('/verify-email').get(validate(verifyEmailSchema), verifyEmail);
router.route('/resend-verification-email').post(validate(resendVerificationEmailSchema), resendVerificationEmail);
router.route('/google').get(googleAuthRedirect);
router.route('/google/callback').get(googleAuthCallback);

// Aliases (in case Google Console redirect URI uses /oauth/google/*)
router.route('/oauth/google').get(googleAuthRedirect);
router.route('/oauth/google/callback').get(googleAuthCallback);

export default router;