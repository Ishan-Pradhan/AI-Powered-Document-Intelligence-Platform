import { userRepository } from "../repositories/users.repository"
import { verificationRepository } from "../repositories/verification.repository"
import { ApiError } from "../utils/ApiError"
import { getGoogleOAuthClient } from "../utils/googleOAuth.utils"
import { getGravatar } from "../utils/gravatar.utils"
import { generateToken, hashPassword } from "../utils/security.utils"
import { generateAccessAndRefereshTokens } from "../utils/token.utils"
import { Request, Response } from "express"
import crypto from "crypto"
import { baseCookieOptions } from "../config/cookie.config"
import { asyncHandler } from "../utils/AsyncHandler"


export const googleAuthRedirect = async (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_CALLBACK_URL

  if (!clientId || !redirectUri) {
    throw new ApiError(500, "Missing GOOGLE_CLIENT_ID or GOOGLE_CALLBACK_URL")
  }

  const state = crypto.randomBytes(16).toString("hex")
  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  })

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code
    const state = req.query.state
    const cookieState = req.cookies?.google_oauth_state

    if (!code || typeof code !== "string") {
      throw new ApiError(400, "Missing OAuth code")
    }

    if (!state || typeof state !== "string" || !cookieState || state !== cookieState) {
      throw new ApiError(400, "Invalid OAuth state")
    }

    res.clearCookie("google_oauth_state", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    const oauthClient = getGoogleOAuthClient()
    const { tokens } = await oauthClient.getToken(code)
    if (!tokens.id_token) {
      throw new ApiError(400, "Google did not return an id_token")
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const email = payload?.email
    const name = payload?.name || "User"
    const emailVerified = payload?.email_verified

    if (!email) {
      throw new ApiError(400, "Google account has no email")
    }

    let user = await userRepository.findByEmail(email)
    if (!user) {
      const userCount = await userRepository.count()
      const role = userCount === 0 ? "admin" : "user"

      // Keep it simple: we store a random password so schema stays unchanged.
      const randomPassword = generateToken()
      const hashedPassword = await hashPassword(randomPassword)

      user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
        isVerified: Boolean(emailVerified),
        authProvider: "google",
        avatarUrl: getGravatar(email),
        role,
      } as any)
    } else {
      if (!user.avatarUrl) {
        user.avatarUrl = getGravatar(user.email)
      }
      if (emailVerified && !user.isVerified) {
        user.isVerified = true
      }


      await user.save()
    }

    // If they verified via Google, cleanup any pending email-verification tokens.
    if (user.isVerified) {
      await verificationRepository.deleteEmailVerificationsForUser(user.id)
    }

    if (user.isBlocked) {
      const errorRedirectUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent("Your account has been blocked")}`
      return res.redirect(errorRedirectUrl);
    }


    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user.id)

    const redirectUrl = process.env.GOOGLE_SUCCESS_REDIRECT || process.env.FRONTEND_URL
    if (redirectUrl) {
      return res
        .cookie("accessToken", accessToken, baseCookieOptions)
        .cookie("refreshToken", refreshToken, baseCookieOptions)
        .redirect(redirectUrl)
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, baseCookieOptions)
      .cookie("refreshToken", refreshToken, baseCookieOptions)
      .json({ success: true, message: "Google login successful" })
 
})