import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const oauthProviderSchema = z.object({
  provider: z.enum(["google", "github"]),
})

export type OauthProviderInput = z.infer<typeof oauthProviderSchema>


export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").refine(val => /\s/.test(val), {
    message: "Name must include at least one space (e.g., First Last)",
  }),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",})

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>