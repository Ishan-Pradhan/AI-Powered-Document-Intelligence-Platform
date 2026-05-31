import express, { Request, Response } from 'express';
import { sequelize } from './config/db';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import './models';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

//routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/ai", aiRoutes);



app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("<h1>Hello World</h1>")
})

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`app is listening at ${process.env.PORT}`)
})
