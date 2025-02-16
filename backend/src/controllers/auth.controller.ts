// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AppError } from "../middlewares/error.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError("Google token is required", 400);
      }

      const result = await authService.verifyGoogleToken(token);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async appleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, userInfo } = req.body;

      if (!idToken) {
        throw new AppError("Apple ID token is required", 400);
      }

      const result = await authService.verifyAppleToken(idToken, userInfo);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async startTelegramVerification(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        throw new AppError("User ID not found", 400);
      }

      const result = await authService.startTelegramVerification(req.user.id);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTelegramVerificationStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        throw new AppError("User ID not found", 400);
      }

      const status = await authService.getTelegramVerificationStatus(
        req.user.id
      );
      res.status(200).json({
        status: "success",
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}
