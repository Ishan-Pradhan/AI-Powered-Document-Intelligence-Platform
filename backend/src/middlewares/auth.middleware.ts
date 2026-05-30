import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError'
import { AuthRequest, JwtPayload } from '../types/auth.types'
import { userRepository } from '../repositories/users.repository'


export const verifyJWT = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload
    req.user = decodedToken
    next()
  } catch (error) {
    throw new ApiError(401, "Invalid access token")
  }
}

export const isAdmin = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const user = req.user
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const adminUser = await userRepository.findById(user.id)

  if (!adminUser || adminUser.role !== "admin") {
    throw new ApiError(403, "Unauthorized request")
  }

  req.adminUser = adminUser
  next()
}


export const checkBlockedUser = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const user = req.user
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const foundUser = await userRepository.findById(user.id)

  if (!foundUser) {
    throw new ApiError(404, "User not found")
  }

  if (foundUser.isBlocked) {
    throw new ApiError(403, "User is blocked")
  }
  next()
}
