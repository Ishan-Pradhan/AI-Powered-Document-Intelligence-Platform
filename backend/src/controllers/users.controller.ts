import { userRepository } from '../repositories/users.repository';
import { ApiError } from '../utils/ApiError';
import type { Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../types/auth.types';

// Controller function to get current user details
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return ok(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        role: user.role,
      },
      'Current user retrieved successfully',
    );
  },
);
