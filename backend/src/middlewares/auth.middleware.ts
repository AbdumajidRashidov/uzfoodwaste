// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { AppError } from "./error.middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { UserData } from "../types/user.types";

export interface AuthRequest extends Request {
  user?: UserData;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new AppError("Not authorized to access this route", 401);
    }

    // Verify token
    if (!config.jwtSecret) {
      throw new AppError("JWT secret is not defined", 500);
    }

    const decoded = jwt.verify(
      token,
      config.jwtSecret as jwt.Secret
    ) as jwt.JwtPayload;
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      throw new AppError("Invalid token", 401);
    }
    // Get user from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        is_verified: true,
        language_preference: true,
        role: true,
        created_at: true,
        updated_at: true,
        phone: true,
        customer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        business: {
          select: {
            id: true,
            company_name: true,
            is_verified: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Not authorized to access this route", 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authorized to access this route", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("User role not authorized to access this route", 403);
    }
    next();
  };
};
