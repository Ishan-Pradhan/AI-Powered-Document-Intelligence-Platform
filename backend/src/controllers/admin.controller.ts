import { Response } from "express"
import { userRepository } from "../repositories/users.repository"
import { AuthRequest } from "../types/auth.types"
import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/AsyncHandler"
import { ok } from "../utils/ApiResponse"

//block and unblock user (admin only)
export const blockAndUnblockUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.params.id as string
        const user = await userRepository.findById(userId)
        if (!user) {
            throw new ApiError(404, 'User not found')
        }
        user.isBlocked = !user.isBlocked
        await user.save()
        return ok(res, null, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` )
})