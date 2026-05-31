import { baseCookieOptions } from "../config/cookie.config";
import { userRepository } from "../repositories/users.repository";
import { verificationRepository } from "../repositories/verification.repository";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/security.utils";
import { generateAccessAndRefereshTokens } from "../utils/token.utils";
import type { Request, Response } from "express";
import { sendVerificationEmail } from "../services/email.service";

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

    const verificationToken = generateToken()
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
