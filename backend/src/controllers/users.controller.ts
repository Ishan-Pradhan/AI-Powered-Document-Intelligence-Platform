import { userRepository } from "../repositories/users.repository"
import { ApiError } from "../utils/ApiError"
import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { getGravatar } from "../utils/gravatar.utils"
import { asyncHandler } from "../utils/AsyncHandler"
import { ok } from "../utils/ApiResponse"

// Controller function to get current user details
export const getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {

    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized: No access token provided");
    }
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as { id: string };
    const user = await userRepository.findById(decoded.id
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.avatarUrl) {
      user.avatarUrl = getGravatar(user.email)
      await user.save()
    }

    return ok(res,  {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      role: user.role
    }, "Current user retrieved successfully");
})







