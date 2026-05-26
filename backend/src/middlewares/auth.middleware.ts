import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError'
import { AuthRequest, JwtPayload } from '../types/auth.types'


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
