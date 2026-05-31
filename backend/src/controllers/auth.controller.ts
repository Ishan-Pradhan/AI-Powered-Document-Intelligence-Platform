import { baseCookieOptions } from "../config/cookie.config"
import { userRepository } from "../repositories/users.repository"
import { verificationRepository } from "../repositories/verification.repository"
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service"
import { AuthRequest, LoginUserTypes, RegisterUserTypes } from "../types/auth.types"
import { ApiError } from "../utils/ApiError"
import { getGravatar } from "../utils/gravatar.utils"
import { comparePassword, generateToken, hashPassword } from "../utils/security.utils"
import { generateAccessAndRefereshTokens } from "../utils/token.utils"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"

// Controller function to handle user registration
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterUserTypes

    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      throw new ApiError(400, "Email already exists")
    }

    const hashedPassword = await hashPassword(password)

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
    const verificationToken = generateToken()
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

    return res.status(201).cookie("accessToken", accessToken, baseCookieOptions).cookie("refreshToken", refreshToken, baseCookieOptions).json({
      success: true,
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
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body as LoginUserTypes
  try {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required")
    }

    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new ApiError(400, "Invalid email or password")
    }

    if (!user.avatarUrl) {
      user.avatarUrl = getGravatar(user.email)
      await user.save()
    }

    if (user.authProvider === "google") {
  throw new ApiError(400, "You previously signed up with Google. Please use Google login.")
}

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials")
    }

    if (user.isBlocked) {
      throw new ApiError(403, "Your account has been blocked");
    }

    if (!user.isVerified) {
      throw new ApiError(403, "Your account is not verified. Please verify your email");
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
export const logoutUser = async (req: Request, res: Response): Promise<Response> => {
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
    return res.clearCookie("accessToken", baseCookieOptions).clearCookie("refreshToken", baseCookieOptions).json({
      success: true,
      message: "User logged out successfully"
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

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
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

//change password (for logged in users)
export const changePassword = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string }

    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required')
    }

    const user = await userRepository.findById(userId)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const isMatch = await comparePassword(currentPassword, user.password)
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect')
    }

    user.password = await hashPassword(newPassword)
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return res.status(500).json({ message })
  }
}

// Controller function to handle forgot password (sends reset link)
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedBody = req.validated?.body as { email?: unknown } | undefined
    const email = (validatedBody?.email ?? (req.body as any)?.email) as unknown
    if (!email || typeof email !== "string") {
      throw new ApiError(400, "Email is required")
    }
    const user = await userRepository.findByEmail(email)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for this email, a password reset link has been sent.",
      })
    }

    if (user.authProvider === "google") {
  return res.status(200).json({
    success: true,
    message: "If an account exists for this email, a password reset link has been sent.",
  })
}


    const resetToken = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await verificationRepository.deletePasswordResetTokensForUser(user.id)
    await verificationRepository.createPasswordResetToken(user.id, resetToken, expiresAt)

    try {
      await sendPasswordResetEmail(user.email, resetToken)
    } catch (emailErr) {
      console.error('Failed to send password reset email', emailErr)
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists for this email, a password reset link has been sent.",
    })

  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    const message = error instanceof Error ? error.message : "Something went wrong"
    return res.status(500).json({ message })
  }
}


// Controller to reset password using token (public)
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedBody = req.validated?.body as { token?: unknown; newPassword?: unknown } | undefined
    const token = (validatedBody?.token ?? (req.body as any)?.token) as unknown
    const newPassword = (validatedBody?.newPassword ?? (req.body as any)?.newPassword) as unknown

    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'Reset token is required')
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters')
    }

    const verification = await verificationRepository.findPasswordResetByToken(token)
    if (!verification) {
      throw new ApiError(400, 'Invalid or expired reset token')
    }

    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      await verificationRepository.deleteById(verification.id)
      throw new ApiError(400, 'Reset token has expired')
    }

    const user = await userRepository.findById(verification.userId)
    if (!user) {
      await verificationRepository.deleteById(verification.id)
      throw new ApiError(404, 'User not found')
    }

    user.password = await hashPassword(newPassword)
    await user.save()

    await verificationRepository.deletePasswordResetTokensForUser(user.id)

    return res.status(200).json({ success: true, message: 'Password has been reset' })
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return res.status(500).json({ message })
  }
}