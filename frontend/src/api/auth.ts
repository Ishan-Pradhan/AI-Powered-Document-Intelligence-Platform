import type { LoginInput, RegisterInput } from "@/schema/auth.schema"

import { api, buildApiUrl } from "./client"

export const login = (payload: LoginInput) => api.post("/api/v1/auth/login", payload)
export const register = (payload: RegisterInput) => api.post("/api/v1/auth/register", payload)

export const oauthUrl = (provider: "google" | "github") =>
  buildApiUrl(`/api/v1/auth/${provider}`)
