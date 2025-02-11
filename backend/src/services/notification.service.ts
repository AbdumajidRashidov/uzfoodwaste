// src/services/notification.service.ts
import { PrismaClient, Notification } from "@prisma/client";
import { EmailService } from "./email.service";
import { PushNotificationService } from "./push-notification.service";
import { SMSNotificationService } from "./sms-notification.service";
import { AppError } from "../middlewares/error.middleware";
import {
  INotification,
  IUserNotificationPreferences,
  CreateNotificationInput,
  UpdatePreferencesInput,
  NotificationQuery,
} from "../types/notification.types";

const prisma = new PrismaClient();
const emailService = new EmailService();
const pushNotificationService = new PushNotificationService();
const smsNotificationService = new SMSNotificationService();

export class NotificationService {
  async createNotification(
    data: CreateNotificationInput
  ): Promise<INotification> {
    const notification = await prisma.notification.create({
      data: {
        ...data,
        is_read: false,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            language_preference: true,
          },
        },
      },
    });

    // Get user preferences
    const preferences = await prisma.userNotificationPreferences.findUnique({
      where: { user_id: data.user_id },
    });

    if (!preferences) {
      return notification;
    }

    // Check if user wants this type of notification
    if (preferences.notification_types.includes(data.type)) {
      // Send email notification
      if (preferences.email_notifications) {
        await emailService.sendNotificationEmail(notification.user.email, {
          title: notification.title,
          message: notification.message,
        });
      }

      // Send push notification
      if (preferences.push_notifications) {
        await pushNotificationService.sendPushNotification(data.user_id, {
          title: notification.title,
          body: notification.message,
          data: {
            type: notification.type,
            reference_id: notification.reference_id || "",
            reference_type: notification.reference_type || "",
          },
        });
      }

      // Send SMS notification
      if (preferences.sms_notifications && notification.user.phone) {
        await smsNotificationService.sendSMS(
          data.user_id,
          `${notification.title}: ${notification.message}`
        );
      }
    }

    return notification;
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: { is_read: true },
    });
  }

  async getUserNotifications(userId: string, query: NotificationQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { user_id: userId };
    if (query.type) where.type = query.type;
    if (query.isRead !== undefined) where.is_read = query.isRead;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserPreferences(
    userId: string,
    preferences: UpdatePreferencesInput
  ): Promise<IUserNotificationPreferences> {
    return await prisma.userNotificationPreferences.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        ...preferences,
      },
      update: preferences,
    });
  }

  async getUserPreferences(
    userId: string
  ): Promise<IUserNotificationPreferences | null> {
    return await prisma.userNotificationPreferences.findUnique({
      where: { user_id: userId },
    });
  }
}
