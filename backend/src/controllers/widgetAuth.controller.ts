import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/users.repository';
import { hashPassword } from '../utils/security.utils';
import { generateAccessAndRefereshTokens } from '../utils/token.utils';
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '../config/cookie.config';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiError } from '../utils/ApiError';

export const guestLogin = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const guestId = crypto.randomUUID();
    const guestEmail = `guest_${guestId}@guest.docintel.local`;
    const guestPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await hashPassword(guestPassword);

    // Create guest user in standard Users table
    const guestUser = await userRepository.create({
      name: `Guest User`,
      email: guestEmail,
      password: hashedPassword,
      isVerified: true,
      role: 'user',
      authProvider: 'local',
    });

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      guestUser.id,
    );

    return res
      .status(201)
      .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
      .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions())
      .json({
        success: true,
        data: {
          id: guestUser.id,
          name: guestUser.name,
          email: guestUser.email,
          avatarUrl: guestUser.avatarUrl,
        },
        message: 'Guest login successful',
      });
  },
);

export const ssoLogin = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.body as { token?: string };

    if (!token) {
      throw new ApiError(400, 'SSO token is required');
    }

    let decodedPayload: { email?: string; name?: string };

    try {
      decodedPayload = jwt.verify(token, env.SSO_SHARED_SECRET) as {
        email?: string;
        name?: string;
      };
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired SSO token');
    }

    const { email, name } = decodedPayload;

    if (!email || !name) {
      throw new ApiError(400, 'SSO token missing required fields (email, name)');
    }

    let user = await userRepository.findByEmail(email);

    if (!user) {
      // Auto-register the member user from SSO
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
        role: 'user',
        authProvider: 'local',
      });
    } else if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been blocked');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user.id,
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
      .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions())
      .json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        message: 'SSO login successful',
      });
  },
);
