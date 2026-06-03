import { CookieOptions } from 'express';
import { parseTimeToMs } from '../utils/parseTime.utils';
import { env } from './env';

const isProduction = env.NODE_ENV === 'production';

export const baseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: parseTimeToMs(env.REFRESH_TOKEN_EXPIRES_IN as string),
});

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: parseTimeToMs(env.ACCESS_TOKEN_EXPIRES_IN as string),
});
