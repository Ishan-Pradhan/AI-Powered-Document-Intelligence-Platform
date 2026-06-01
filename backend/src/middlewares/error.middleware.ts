import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ValidationError } from "sequelize";
import { ApiError } from "../utils/ApiError";

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errors: unknown[] = [];

  // Handle known custom error
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }

  // Sequelize validation error
  else if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.message;
    errors = err.errors;
  }

  // Multer error
  else if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.message;
  }

  // Generic JS error
  else if (err instanceof Error) {
    message = err.message;
  }

  console.error(`[Error] ${message}`, err);

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { errorHandler };