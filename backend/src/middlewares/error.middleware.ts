import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { ValidationError } from 'sequelize'
import { ApiError } from '../utils/ApiError'

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const isMulterError = error instanceof multer.MulterError || error?.name === 'MulterError'
    const isUploadValidationError = typeof error?.message === 'string' && error.message.toLowerCase().includes('unsupported file type')

    const statusCode = error.statusCode || (error instanceof ValidationError || isMulterError || isUploadValidationError ? 400 : 500)
    const message = error.message || "Something went wrong"
    error = new ApiError(statusCode, message, error?.errors || [], err.stack)
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  }

  console.error(`[Error] ${error.message}`)

  return res.status(error.statusCode).json(response)
}

export { errorHandler }
