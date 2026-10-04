import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.coerce.number().default(8080),

    // Database (Supports Neon DATABASE_URL or individual credentials)
    DATABASE_URL: z.string().optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().default(5432),
    DB_NAME: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_SSL: z.string().optional(),

    // JWT
    ACCESS_TOKEN_SECRET: z
      .string()
      .min(32, 'ACCESS_TOKEN_SECRET must be at least 32 chars'),
    ACCESS_TOKEN_EXPIRES_IN: z.string().min(1),

    REFRESH_TOKEN_SECRET: z
      .string()
      .min(32, 'REFRESH_TOKEN_SECRET must be at least 32 chars'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(1),

    // Email (Supports Resend API key or traditional SMTP)
    RESEND_API_KEY: z.string().optional(),
    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.coerce.number().optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASS: z.string().optional(),
    EMAIL_FROM: z.string().min(1),

    // OAuth (Optional)
    GOOGLE_CLIENT_ID: z.string().default(''),
    GOOGLE_CLIENT_SECRET: z.string().default(''),
    GOOGLE_CALLBACK_URL: z.string().default(''),

    GITHUB_CLIENT_ID: z.string().default(''),
    GITHUB_CLIENT_SECRET: z.string().default(''),
    GITHUB_CALLBACK_URL: z.string().default(''),

    // LLM
    GROQ_API_KEY: z.string().min(1),
    CHAT_MODEL: z.string().min(1).default('llama-3.1-8b-instant'),
    GOOGLE_API_KEY: z.string().min(1),

    // URLs & Rate Limiting
    FRONTEND_URL: z.string().optional(),
    BACKEND_URL: z.string().optional(),
    SSO_SHARED_SECRET: z.string().default('default_sso_shared_secret_32_chars_long'),
    CHAT_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60 * 1000),
    CHAT_RATE_LIMIT_MAX: z.coerce.number().default(10),
  })
  .refine(
    (data) =>
      Boolean(
        data.DATABASE_URL ||
          (data.DB_HOST && data.DB_NAME && data.DB_USER && data.DB_PASSWORD),
      ),
    {
      message:
        'Either DATABASE_URL or (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD) must be provided.',
      path: ['DATABASE_URL'],
    },
  )
  .refine(
    (data) =>
      Boolean(
        data.RESEND_API_KEY ||
          (data.EMAIL_HOST && data.EMAIL_PORT && data.EMAIL_USER && data.EMAIL_PASS),
      ),
    {
      message:
        'Either RESEND_API_KEY or (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS) must be provided for email delivery.',
      path: ['RESEND_API_KEY'],
    },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
