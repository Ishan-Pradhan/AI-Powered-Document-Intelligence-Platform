export interface RegisterUserTypes {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserTypes {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string
  email: string
}

import { Request } from 'express'
import { UserInstance } from './users.types';
export interface AuthRequest extends Request {
  user?: JwtPayload
  adminUser?: UserInstance
}