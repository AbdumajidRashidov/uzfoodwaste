import { NotificationItem } from "./../types/notification.types";
// src/services/notification.service.ts
import { PrismaClient, Notification, NotificationType } from "@prisma/client";
import {
  CreateNotificationInput,
  INotification,
  IUserNotificationPreferences,
  NotificationQuery,
} from "../types/notification.types"; // Adjust the import path as necessary
import { EmailService } from "./email.service";
import { PushNotificationService } from "./push-notification.service";
import { SMSNotificationService } from "./sms-notification.service";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();
const emailService = new EmailService();
const pushNotificationService = new PushNotificationService();
const smsNotificationService = new SMSNotificationService();

export class NotificationService {
  async createNotification(
    data: CreateNotificationInput
  ): Promise<INotification> {
    // Get reservation details for multi-item notifications
    let itemDetails: any[] = [];
    if (data.reference_type === "RESERVATION" && data.reference_id) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: data.reference_id },
        include: {
          reservation_items: {
            include: {
              listing: {
                include: {
                  business: true,
                  location: true,
                },
              },
            },
          },
        },
      });

      if (reservation) {
        itemDetails = reservation.reservation_items.map((item) => ({
          title: item.listing.title || "",
          business: item.listing.business.company_name || "",
          quantity: item.quantity || 0,
        }));
      }
    }

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

    const preferences = await prisma.userNotificationPreferences.findUnique({
      where: { user_id: data.user_id },
    });

    if (!preferences?.notification_types.includes(data.type)) {
      return notification;
    }

    // Enhanced notification message for multiple items
    const enhancedMessage =
      itemDetails.length > 0
        ? `${data.message}\n\nItems:\n${itemDetails
            .map(
              (item) =>
                `- ${item.title} (x${item.quantity}) from ${item.business}`
            )
            .join("\n")}`
        : data.message;

    // Send notifications based on preferences
    await this.sendNotifications({
      preferences,
      notification: {
        ...notification,
        message: enhancedMessage,
      },
      itemDetails,
    });

    return notification;
  }

  async sendNotifications({
    preferences,
    notification,
    itemDetails,
  }: {
    preferences: IUserNotificationPreferences;
    notification: Notification & {
      user: { email: string; phone: string };
    };
    itemDetails: NotificationItem[];
  }) {
    const notificationPromises = [];

    if (preferences.email_notifications) {
      interface NotificationEmailData {
        title: string;
        message: string;
        type: string;
        timestamp: Date;
        items?: NotificationItem[]; // Add this line
      }
    }

    if (preferences.push_notifications) {
      const pushData: any = {
        title: notification.title,
        body: notification.message,
        data: {
          type: notification.type,
          reference_id: notification.reference_id || "",
          reference_type: notification.reference_type || "",
        },
      };

      if (itemDetails.length > 0) {
        pushData.data.items = itemDetails;
      }

      notificationPromises.push(
        pushNotificationService.sendPushNotification(
          notification.user_id,
          pushData
        )
      );
    }

    if (preferences.sms_notifications && notification.user.phone) {
      const smsMessage =
        itemDetails.length > 0
          ? `${notification.title}: ${notification.message} (${itemDetails.length} items)`
          : `${notification.title}: ${notification.message}`;

      notificationPromises.push(
        smsNotificationService.sendSMS(notification.user_id, smsMessage)
      );
    }

    await Promise.all(notificationPromises);
  }

  // Rest of the service methods remain the same
  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification> {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, user_id: userId },
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
        include: {
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
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
    preferences: IUserNotificationPreferences
  ): Promise<IUserNotificationPreferences> {
    const updatedPreferences = await prisma.userNotificationPreferences.upsert({
      where: { user_id: userId },
      update: preferences,
      create: {
        ...preferences,
      },
    });

    return updatedPreferences;
  }

  async getUserPreferences(
    userId: string
  ): Promise<IUserNotificationPreferences | null> {
    const preferences = await prisma.userNotificationPreferences.findUnique({
      where: { user_id: userId },
    });

    if (!preferences) {
      throw new AppError("User preferences not found", 404);
    }

    return preferences;
  }
}
