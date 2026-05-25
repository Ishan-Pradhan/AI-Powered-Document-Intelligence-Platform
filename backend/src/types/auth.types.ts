export interface RegisterUserTypes {
    name:string;
    email:string;
    password: string;
}

export interface LoginUserTypes {
    email:string;
    password:string;
}

export interface JwtPayload {
  id: string
  email: string
}

import { Request } from 'express'
export interface AuthRequest extends Request {
  user?: JwtPayload
}