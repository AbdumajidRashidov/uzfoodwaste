// src/controllers/notification.controller.ts
import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";
import { Notification } from "@prisma/client";

const notificationService = new NotificationService();

export class NotificationController {
  async getUserNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        type: req.query.type as Notification["type"] | undefined,
        isRead: req.query.isRead ? req.query.isRead === "true" : undefined,
      };

      const result = await notificationService.getUserNotifications(
        userId,
        query
      );
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const { notificationId } = req.params;
      const notification = await notificationService.markAsRead(
        notificationId,
        userId
      );

      res.status(200).json({
        status: "success",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        status: "success",
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const preferences = await notificationService.updateUserPreferences(
        userId,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID not found", 400);
      }

      const preferences = await notificationService.getUserPreferences(userId);

      res.status(200).json({
        status: "success",
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }
}
