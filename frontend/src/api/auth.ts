import type { LoginInput, RegisterInput } from "@/schema/auth.schema"

import { api, buildApiUrl } from "./client"

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export type AuthUserDto = {
  id: string
  email: string
  name: string
}

export const login = (payload: LoginInput) =>
  api.post<ApiResponse<AuthUserDto>>("/api/v1/auth/login", payload)

export const register = (payload: RegisterInput) =>
  api.post<ApiResponse<AuthUserDto>>("/api/v1/auth/register", payload)

export const oauthUrl = (provider: "google" | "github") =>
  buildApiUrl(`/api/v1/auth/${provider}`)
