import { CookieOptions } from 'express';
import { parseTimeToMs } from '../utils/parseTime.utils';
import { env } from './env';

const isSecureEnvironment =
  env.NODE_ENV === 'production' ||
  Boolean(process.env.RENDER) ||
  Boolean(env.BACKEND_URL?.startsWith('https')) ||
  Boolean(env.FRONTEND_URL?.startsWith('https'));

export const baseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isSecureEnvironment,
  sameSite: isSecureEnvironment ? 'none' : 'lax',
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: parseTimeToMs(env.REFRESH_TOKEN_EXPIRES_IN as string),
});

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: parseTimeToMs(env.ACCESS_TOKEN_EXPIRES_IN as string),
});
