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