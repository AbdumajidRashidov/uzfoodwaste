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

export interface NotificationEmailData {
  type: MessageType;
  subject: string;
  body: string;
  recipientEmail: string;
  timestamp: Date;
  title?: string; // Make optional with ?
  message?: string; // Make optional with ?
}
