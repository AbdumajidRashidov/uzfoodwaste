// src/controllers/referral.controller.ts
import { Request, Response, NextFunction } from "express";
import { ReferralService } from "../services/referral.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const referralService = new ReferralService();

export class ReferralController {
  async createReferralCode(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const referralCode = await referralService.createReferralCode(
        userId,
        req.body
      );
      res.status(201).json({
        status: "success",
        data: referralCode,
      });
    } catch (error) {
      next(error);
    }
  }

  async applyReferralCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const { code } = req.body;
      const result = await referralService.applyReferralCode(userId, code);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReferrals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const referrals = await referralService.getUserReferrals(userId);
      res.status(200).json({
        status: "success",
        data: referrals,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPoints(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const points = await referralService.getUserPoints(userId);
      res.status(200).json({
        status: "success",
        data: points,
      });
    } catch (error) {
      next(error);
    }
  }
}
