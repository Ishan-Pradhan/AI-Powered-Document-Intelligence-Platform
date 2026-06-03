import { Router } from 'express';
import { getCurrentUser } from '../controllers/users.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  loginSchema,
  refreshAccessTokenSchema,
  registerSchema,
  resendVerificationEmailSchema,
  verifyEmailSchema,
} from '../validations/auth.validation';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validations/auth.validation';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller';
import {
  googleAuthCallback,
  googleAuthRedirect,
} from '../controllers/oauth.controller';
import {
  resendVerificationEmail,
  verifyEmail,
} from '../controllers/verifications.controller';
import { guestLogin, ssoLogin } from '../controllers/widgetAuth.controller';

const router = Router();

router.route('/register').post(validate(registerSchema), registerUser);
router.route('/guest').post(guestLogin);
router.route('/sso').post(ssoLogin);
router.route('/login').post(validate(loginSchema), loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router
  .route('/refresh-access-token')
  .post(validate(refreshAccessTokenSchema), refreshAccessToken);
router.route('/verify-email').get(validate(verifyEmailSchema), verifyEmail);
router
  .route('/resend-verification-email')
  .post(validate(resendVerificationEmailSchema), resendVerificationEmail);
router
  .route('/forgot-password')
  .post(validate(forgotPasswordSchema), forgotPassword);
router
  .route('/reset-password')
  .post(validate(resetPasswordSchema), resetPassword);
router
  .route('/change-password')
  .post(verifyJWT, validate(changePasswordSchema), changePassword);

router.route('/google').get(googleAuthRedirect);
router.route('/google/callback').get(googleAuthCallback);

// Aliases (in case Google Console redirect URI uses /oauth/google/*)
router.route('/oauth/google').get(googleAuthRedirect);
router.route('/oauth/google/callback').get(googleAuthCallback);

export default router;
