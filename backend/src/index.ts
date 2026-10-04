import express, { Request, Response } from 'express';
import { sequelize } from './config/db';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { limiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { swaggerSpec } from './config/swagger.config';
import './models';
import { startCleanupJob } from './jobs/cleanupGuestUsers';

dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .concat([
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ])
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production' ||
        origin.endsWith('.vercel.app');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(limiter);

//routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import chatRoutes from './routes/chat.routes';
import healthRoutes from './routes/health.routes';

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1", healthRoutes);

// ── Swagger UI ──────────────────────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'DocIntelAI API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  }),
);

// Serve the raw OpenAPI JSON so clients can import it into Postman / Insomnia
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("<h1>Hello World</h1>")
})

// 404 handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler
app.use(errorHandler);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    startCleanupJob();
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`app is listening at ${process.env.PORT}`)
})
