import { z } from "zod";

export const registerSchema = {
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
};

export const verifyEmailSchema = {
  query: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
};

export const resendVerificationEmailSchema = {
  body: z.object({
    email: z.email("Invalid email"),
  }),
};