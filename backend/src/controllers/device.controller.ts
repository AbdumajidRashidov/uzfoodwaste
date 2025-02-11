// src/controllers/device.controller.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { PushNotificationService } from "../services/push-notification.service";
import { SMSNotificationService } from "../services/sms-notification.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();
const pushNotificationService = new PushNotificationService();
const smsNotificationService = new SMSNotificationService();

export class DeviceController {
  async registerDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const device = await pushNotificationService.registerDevice(
        userId,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  async unregisterDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const { fcm_token } = req.body;
      await pushNotificationService.unregisterDevice(userId, fcm_token);

      res.status(200).json({
        status: "success",
        message: "Device unregistered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserDevices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const devices = await prisma.userDevice.findMany({
        where: { user_id: userId },
        orderBy: { last_used_at: "desc" },
      });

      res.status(200).json({
        status: "success",
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPhone(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const { phone_number } = req.body;
      const verification = await smsNotificationService.verifyPhoneNumber(
        userId,
        phone_number
      );

      res.status(200).json({
        status: "success",
        data: {
          verification_sid: verification.sid,
          status: verification.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmPhoneVerification(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const { phone_number, code } = req.body;
      const verificationCheck =
        await smsNotificationService.checkVerificationCode(
          userId,
          phone_number,
          code
        );

      res.status(200).json({
        status: "success",
        data: {
          status: verificationCheck.status,
          valid: verificationCheck.status === "approved",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDeviceToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const { old_token, new_token } = req.body;

      // Find the existing device
      const device = await prisma.userDevice.findFirst({
        where: {
          user_id: userId,
          fcm_token: old_token,
        },
      });

      if (!device) {
        throw new AppError("Device not found", 404);
      }

      // Update the token
      const updatedDevice = await prisma.userDevice.update({
        where: { id: device.id },
        data: {
          fcm_token: new_token,
          last_used_at: new Date(),
        },
      });

      res.status(200).json({
        status: "success",
        data: updatedDevice,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const { fcm_token } = req.params;

      const device = await prisma.userDevice.findFirst({
        where: {
          user_id: userId,
          fcm_token: fcm_token,
        },
      });

      res.status(200).json({
        status: "success",
        data: {
          is_registered: !!device,
          device: device,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
