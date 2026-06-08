import type { LoginInput, RegisterInput } from "@/schema/auth.schema";

import { api, buildApiUrl } from "./client";
import type { ApiResponse, AuthUserDto } from "@/types/ApiTypes";

export const login = (payload: LoginInput) =>
  api.post<ApiResponse<AuthUserDto>>("/api/v1/auth/login", payload);

export const registerUser = (payload: RegisterInput) =>
  api.post<ApiResponse<AuthUserDto>>("/api/v1/auth/register", payload);

export const logout = () =>
  api.post<ApiResponse<AuthUserDto>>("/api/v1/auth/logout", {});

export type ResendVerificationEmailResponse = {
  success: boolean;
  message: string;
  verifyLink?: string;
};

export const getCurrentUser = () =>
  api.get<ApiResponse<AuthUserDto>>("/api/v1/auth/current-user");

export const resendVerificationEmail = (email: string) =>
  api.post<ResendVerificationEmailResponse>(
    "/api/v1/auth/resend-verification-email",
    { email },
  );

export const forgotPassword = (email: string) =>
  api.post<{ success: boolean; message: string }>(
    "/api/v1/auth/forgot-password",
    {
      email,
    },
  );

export const resetPassword = (payload: {
  token: string;
  newPassword: string;
}) =>
  api.post<{ success: boolean; message: string }>(
    "/api/v1/auth/reset-password",
    payload,
  );

export const oauthUrl = (provider: "google" | "github") =>
  buildApiUrl(`/api/v1/auth/${provider}`);

export const guestLogin = () =>
  api.post<ApiResponse<AuthUserDto>>("/api/v1/auth/guest");

export const ssoLogin = (token: string) =>
  api.post<ApiResponse<AuthUserDto>>("/api/v1/auth/sso", { token });
