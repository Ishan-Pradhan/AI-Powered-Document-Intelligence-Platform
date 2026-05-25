import { ZodError, ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

type Schema = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validated = {};

      // Validate each part only if schema exists
      if (schema.body) {
        const parsedBody = schema.body.parse(req.body);
        req.body = parsedBody;
        req.validated.body = parsedBody;
      }

      if (schema.query) {
        const parsedQuery = schema.query.parse(req.query);
        req.validated.query = parsedQuery;
      }

      if (schema.params) {
        const parsedParams = schema.params.parse(req.params);
        req.validated.params = parsedParams;
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      return next(error);
    }
  };
};