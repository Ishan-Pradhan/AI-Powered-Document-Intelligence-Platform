import { Response } from "express"
import { userRepository } from "../repositories/users.repository"
import { AuthRequest } from "../types/auth.types"
import { ApiError } from "../utils/ApiError"

//block and unblock user (admin only)
export const blockAndUnblockUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id as string
        const user = await userRepository.findById(userId)
        if (!user) {
            throw new ApiError(404, 'User not found')
        }
        user.isBlocked = !user.isBlocked
        await user.save()
        return res.status(200).json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` })
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message })
        }
        const message = error instanceof Error ? error.message : 'Something went wrong'
        return res.status(500).json({ message })
    }
}