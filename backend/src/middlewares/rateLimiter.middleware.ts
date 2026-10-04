import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 1000,

  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) => req.path === '/health',

  handler: (_req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      data: null,
      errors: null,
    });
  },
});

// Dedicated rate limiter for AI chat endpoints to protect LLM token limits and free tier quotas
export const chatLimiter = rateLimit({
  windowMs: Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: Number(process.env.CHAT_RATE_LIMIT_MAX) || 10, // 10 messages per minute per IP

  standardHeaders: true,
  legacyHeaders: false,

  handler: (_req, res) => {
    return res.status(429).json({
      success: false,
      message:
        'Chat limit reached. Please wait a minute before sending another message to preserve AI quota.',
      data: null,
      errors: null,
    });
  },
});

