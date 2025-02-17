// src/controllers/telegram-auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { telegramAuthService } from "../services/telegram-auth.service";
import { AppError } from "../middlewares/error.middleware";

export class TelegramAuthController {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const telegramData = req.body;

      // Validate required fields
      if (!telegramData.id || !telegramData.auth_date || !telegramData.hash) {
        throw new AppError(
          "Missing required Telegram authentication data",
          400
        );
      }

      const result = await telegramAuthService.authenticateUser(telegramData);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const telegramAuthController = new TelegramAuthController();
