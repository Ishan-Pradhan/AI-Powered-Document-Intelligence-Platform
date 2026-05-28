import { userRepository } from "../repositories/users.repository"
import { ApiError } from "../utils/ApiError"
import type { Request, Response } from "express"
import jwt, { type SignOptions } from "jsonwebtoken"
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { LoginUserTypes, RegisterUserTypes } from "../types/auth.types";
import { baseCookieOptions } from "../config/cookie.config";
import { verificationRepository } from "../repositories/verification.repository";
import { sendVerificationEmail } from "../services/email.service";
import { getGravatar } from "../utils/gravatar.utils";


// Helper function to generate access and refresh tokens
export const generateAccessAndRefereshTokens = async (userId: string) => {
    try {
    const user = await userRepository.findById(userId)
    if (!user) throw new ApiError(404, "User not found")

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
    if (!accessTokenSecret) throw new ApiError(500, "ACCESS_TOKEN_SECRET is not set")

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
    if (!refreshTokenSecret) throw new ApiError(500, "REFRESH_TOKEN_SECRET is not set")

    const accessTokenExpiresIn = (process.env.ACCESS_TOKEN_EXPIRES_IN || "15m") as SignOptions["expiresIn"]
    const refreshTokenExpiresIn = (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as SignOptions["expiresIn"]

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      accessTokenSecret,
      { expiresIn: accessTokenExpiresIn }
    )

    const refreshToken = jwt.sign(
      { id: user.id },
      refreshTokenSecret,
      { expiresIn: refreshTokenExpiresIn }
    )

    user.refreshToken = refreshToken
    await user.save()

    return { accessToken, refreshToken }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while generating tokens"
    throw new ApiError(500, message)
  }
}

const getGoogleOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_CALLBACK_URL

  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApiError(
      500,
      "Missing Google OAuth env vars (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)"
    )
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri)
}

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

export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
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
      const randomPassword = crypto.randomBytes(32).toString("hex")
      const hashedPassword = await bcrypt.hash(randomPassword, 10)

      user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
        isVerified: Boolean(emailVerified),
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
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }

    const message = error instanceof Error ? error.message : "Something went wrong"
    return res.status(500).json({ message })
  }
}

// Controller function to handle user registration
export const registerUser = async(req:Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterUserTypes

    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      throw new ApiError(400, "Email already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userCount = await userRepository.count()
    const role = userCount === 0 ? "admin" : "user"

    const newUser = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      avatarUrl: getGravatar(email),
      role,
    })

    // create verification token (valid for 24h) and email it
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await verificationRepository.deleteEmailVerificationsForUser(newUser.id)
    await verificationRepository.createEmailVerification(newUser.id, verificationToken, expiresAt)

    let verificationEmailSent = false
    let verifyLink: string | undefined
    try {
      const result = await sendVerificationEmail(newUser.email, verificationToken)
      verificationEmailSent = true
      verifyLink = result.verifyLink
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
    }

     const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(newUser.id)

     return res.status(201).cookie("accessToken",accessToken, baseCookieOptions).cookie("refreshToken",refreshToken, baseCookieOptions).json({
      success:true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        verificationEmailSent,
        ...(process.env.NODE_ENV === "development" && verifyLink ? { verifyLink } : {}),
      },
      message: verificationEmailSent
        ? "User registered successfully. Verification email sent."
        : "User registered successfully. Verification email could not be sent."
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }

    const message = error instanceof Error ? error.message : "Something went wrong"
    return res.status(500).json({ message })
  }
}


// Controller function to handle user login
export const loginUser = async(req:Request, res: Response): Promise<Response> => {
  const { email, password } = req.body as LoginUserTypes
  try {
    if(!email || !password) {
      throw new ApiError(400, "Email and password are required")
    }

    const user = await userRepository.findByEmail(email)
    if(!user) {
      throw new ApiError(400, "Invalid email or password")
    }

    if (!user.avatarUrl) {
      user.avatarUrl = getGravatar(user.email)
      await user.save()
    }

      const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user.id)
    return res.status(200).cookie("accessToken", accessToken, baseCookieOptions).cookie("refreshToken", refreshToken, baseCookieOptions).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      message: "User logged in successfully"
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }

    const message = error instanceof Error ? error.message : "Something went wrong"
    return res.status(500).json({ message })
  }
}

// Controller function to handle user logout
export const logoutUser = async(req:Request, res: Response): Promise<Response> => {
  try {
    const accessToken = req.cookies.accessToken
   
      if (accessToken) {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as { id: string };

      const user = await userRepository.findById(decoded.id);

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
  return  res.clearCookie("accessToken", baseCookieOptions).clearCookie("refreshToken", baseCookieOptions).json({
      success: true,
      message: "User logged out successfully"
    })
  }catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    } 
    return res.status(500).json({
      message: "Internal server error",
    });
  }}


  // Controller function to get current user details
  export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const accessToken = req.cookies.accessToken;
      console.log("access token is ", accessToken)
      if (!accessToken) {
        throw new ApiError(401, "Unauthorized: No access token provided");
      }
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as { id: string };
      const user = await userRepository.findById(decoded.id
); 

if(!user) {
  throw new ApiError(404, "User not found");
}

if (!user.avatarUrl) {
  user.avatarUrl = getGravatar(user.email)
  await user.save()
}
    return res.status(200).json({
      success: true,
      data: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        avatarUrl: user?.avatarUrl,
        isVerified: user?.isVerified,
        role: user?.role,
      },
      message: "Current user retrieved successfully"
    }); } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
    return res.status(500).json({ message: "Internal server error" })}}


// Controller function to refresh access token using refresh token
export const refreshAccessToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "Unauthorized: No refresh token provided");
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string };
    const user = await userRepository.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Unauthorized: Invalid refresh token");
    }
      const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user.id);
      return res.status(200).cookie("accessToken", accessToken, baseCookieOptions).cookie("refreshToken", newRefreshToken, baseCookieOptions).json({
        success: true,
        data: user,
        message: "Token refreshed successfully"
      });
   }catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
    return res.status(500).json({ message: "Internal server error" });
   }}

   //verify email 
  export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedQuery = req.validated?.query as { token?: unknown } | undefined;
      const token = (validatedQuery?.token ?? (req.query as any)?.token) as unknown;

      if (!token || typeof token !== "string") {
        throw new ApiError(400, "Verification token is required")
      }

      const verification = await verificationRepository.findEmailVerificationByToken(token)

      if (!verification) {
        throw new ApiError(400, "Invalid verification token")
      }

      if (new Date(verification.expiresAt).getTime() < Date.now()) {
        await verificationRepository.deleteById(verification.id)
        throw new ApiError(400, "Verification token has expired")
      }

      const user = await userRepository.findById(verification.userId)
      if (!user) {
        await verificationRepository.deleteById(verification.id)
        throw new ApiError(404, "User not found")
      }

      const frontendUrl = process.env.FRONTEND_URL
      const successRedirectUrl =
        process.env.EMAIL_VERIFY_SUCCESS_REDIRECT ||
        (frontendUrl
          ? `${frontendUrl.replace(/\/$/, "")}/verify-success`
          : undefined)

      if (user.isVerified) {
        await verificationRepository.deleteEmailVerificationsForUser(user.id)

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
          user.id
        )

        if (successRedirectUrl) {
          res
            .cookie("accessToken", accessToken, baseCookieOptions)
            .cookie("refreshToken", refreshToken, baseCookieOptions)
            .redirect(successRedirectUrl)
          return
        }

        res
          .status(200)
          .cookie("accessToken", accessToken, baseCookieOptions)
          .cookie("refreshToken", refreshToken, baseCookieOptions)
          .json({
            success: true,
            message: "Email already verified",
          })
        return
      }

      user.isVerified = true
      await user.save()

      await verificationRepository.deleteEmailVerificationsForUser(user.id)

      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user.id)

      if (successRedirectUrl) {
        res
          .cookie("accessToken", accessToken, baseCookieOptions)
          .cookie("refreshToken", refreshToken, baseCookieOptions)
          .redirect(successRedirectUrl)
        return
      }

      res
        .status(200)
        .cookie("accessToken", accessToken, baseCookieOptions)
        .cookie("refreshToken", refreshToken, baseCookieOptions)
        .json({
          success: true,
          message: "Email verified successfully",
        })
      return
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message })
        return
      }

      const message = error instanceof Error ? error.message : "Something went wrong"
      res.status(500).json({ message })
      return
    }
   }

  // resend verification link (for users who didn't verify the first time)
  export const resendVerificationEmail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const validatedBody = req.validated?.body as { email?: unknown } | undefined
      const email = (validatedBody?.email ?? (req.body as any)?.email) as unknown

      if (!email || typeof email !== "string") {
        throw new ApiError(400, "Email is required")
      }

      const user = await userRepository.findByEmail(email)

      // Always return the same response to avoid leaking whether an email exists.
      if (!user || user.isVerified) {
        return res.status(200).json({
          success: true,
          message: "If an account exists for this email, a verification link has been sent.",
        })
      }

      const verificationToken = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await verificationRepository.deleteEmailVerificationsForUser(user.id)
      await verificationRepository.createEmailVerification(user.id, verificationToken, expiresAt)

      let verifyLink: string | undefined
      try {
        const result = await sendVerificationEmail(user.email, verificationToken)
        verifyLink = result.verifyLink
      } catch (emailError) {
        console.error("Failed to resend verification email:", emailError)
      }

      return res.status(200).json({
        success: true,
        message: "If an account exists for this email, a verification link has been sent.",
        ...(process.env.NODE_ENV === "development" && verifyLink ? { verifyLink } : {}),
      })
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message })
      }

      const message = error instanceof Error ? error.message : "Something went wrong"
      return res.status(500).json({ message })
    }
  }