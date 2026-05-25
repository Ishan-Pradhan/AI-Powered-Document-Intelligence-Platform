import { userRepository } from "../repositories/users.repository"
import { ApiError } from "../utils/ApiError"
import type { Request, Response } from "express"
import jwt, { type SignOptions } from "jsonwebtoken"
import bcrypt from "bcryptjs";
import { RegisterUserTypes } from "../types/auth.types";
import { baseCookieOptions } from "../config/cookie.config";


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

// Controller function to handle user registration
export const registerUser = async(req:Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterUserTypes

    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      throw new ApiError(400, "Email already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    })

     const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(newUser.id)

     return res.status(201).cookie("accessToken",accessToken, baseCookieOptions).cookie("refreshToken",refreshToken, baseCookieOptions).json({
      success:true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      message: "User registered successfully"
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }

    const message = error instanceof Error ? error.message : "Something went wrong"
    return res.status(500).json({ message })
  }
}