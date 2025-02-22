// src/types/notification.types.ts
import {
  Notification,
  UserNotificationPreferences,
  UserDevice,
  SmsNotificationLog,
} from "@prisma/client";

// Get NotificationType from Prisma client
export type {
  Notification,
  UserNotificationPreferences,
  UserDevice,
  SmsNotificationLog,
};

export interface INotification extends Notification {
  user?: {
    email: string;
    phone: string;
    language_preference: string;
  };
}

export interface IUserNotificationPreferences
  extends UserNotificationPreferences {}

// Additional helper types
export type CreateNotificationInput = Omit<
  Notification,
  "id" | "created_at" | "updated_at" | "is_read"
>;

export type UpdatePreferencesInput = Partial<
  Omit<
    UserNotificationPreferences,
    "id" | "user_id" | "created_at" | "updated_at"
  >
>;

export type NotificationQuery = {
  page?: number;
  limit?: number;
  type?: Notification["type"];
  isRead?: boolean;
};

type MessageType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface NotificationItem {
  title: string;
  business: string;
  quantity: number;
}

export interface NotificationEmailData {
  title: string;
  message: string;
  type: MessageType;
  timestamp: Date;
  items?: NotificationItem[]; // Made optional for backward compatibility
}
