import { Response } from "express"
import { userRepository } from "../repositories/users.repository"
import { AuthRequest } from "../types/auth.types"
import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/AsyncHandler"
import { ok } from "../utils/ApiResponse"


// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    const { rows: users, count: totalItems } = await userRepository.findAndCountAll({
        limit,
        offset,
        search
    });

    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        isBlocked: u.isBlocked,
        authProvider: u.authProvider,
        avatarUrl: u.avatarUrl,
        createdAt: (u as any).createdAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return ok(res, {
        items: safeUsers,
        meta: {
            totalItems,
            itemCount: safeUsers.length,
            itemsPerPage: limit,
            totalPages,
            currentPage: page
        }
    }, 'Users retrieved successfully');
})

// Block and unblock user (admin only)
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
