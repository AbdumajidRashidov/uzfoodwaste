// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "./error.middleware";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((error) => error.msg);
    throw new AppError(messages.join(". "), 400);
  }
  next();
};
