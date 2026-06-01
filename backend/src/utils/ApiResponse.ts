import { Response } from "express";

export const ok = (
  res: Response,
  data: any = null,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
};

export const fail = (
  res: Response,
  message = "Something went wrong",
  statusCode = 500,
  errors: any = null
) => {  
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  });
};