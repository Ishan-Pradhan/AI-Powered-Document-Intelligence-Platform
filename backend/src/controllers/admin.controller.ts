import { Response } from 'express';
import { userRepository } from '../repositories/users.repository';
import { AuthRequest } from '../types/auth.types';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/AsyncHandler';
import { ok } from '../utils/ApiResponse';
import { serializeUser } from '../serializers/user.serializer';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../utils/pagination.utils';

//    GET ALL USERS (ADMIN ONLY)
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, limit, offset } = getPaginationParams(req.query);

    const search = String(req.query.search || '').trim();

    const { rows: users, count: totalItems } =
      await userRepository.findAndCountAll({
        limit,
        offset,
        search,
      });

    const safeUsers = users.map(serializeUser);

    return ok(
      res,
      {
        items: safeUsers,
        meta: buildPaginationMeta({
          totalItems,
          page,
          limit,
          itemCount: safeUsers.length,
        }),
      },
      'Users retrieved successfully',
    );
  },
);

// BLOCK / UNBLOCK USER
export const blockAndUnblockUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.params.id as string;

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const newStatus = !user.isBlocked;
    user.isBlocked = newStatus;

    await user.save();

    return ok(
      res,
      null,
      `User ${newStatus ? 'blocked' : 'unblocked'} successfully`,
    );
  },
);
