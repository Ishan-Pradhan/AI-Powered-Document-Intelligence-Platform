import { SignOptions } from "jsonwebtoken"
import { userRepository } from "../repositories/users.repository"
import { ApiError } from "./ApiError"
import jwt from "jsonwebtoken"

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