// src/services/push-notification.service.ts
import { firebaseAdmin } from "../config/firebase";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { messaging } from "firebase-admin";

const prisma = new PrismaClient();

export class PushNotificationService {
  async sendPushNotification(
    userId: string,
    data: {
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  ) {
    try {
      // Get user's FCM tokens
      const deviceTokens = await prisma.userDevice.findMany({
        where: {
          user_id: userId,
          fcm_token: {
            not: null,
          },
        },
        select: {
          fcm_token: true,
        },
      });

      if (!deviceTokens.length) {
        return null;
      }

      const tokens = deviceTokens.map((token) => token.fcm_token!);

      const message: messaging.MulticastMessage = {
        notification: {
          title: data.title,
          body: data.body,
        },
        data: data.data || {},
        tokens,
        android: {
          notification: {
            icon: "ic_notification",
            color: "#4CAF50",
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
              sound: "default",
            },
          },
        },
      };

      const response = await firebaseAdmin
        .messaging()
        .sendEachForMulticast(message);

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => (resp.success ? null : tokens[idx]))
          .filter((token): token is string => token !== null);

        if (failedTokens.length > 0) {
          await prisma.userDevice.deleteMany({
            where: {
              fcm_token: {
                in: failedTokens,
              },
            },
          });
        }
      }

      return response;
    } catch (error) {
      console.error("Push notification error:", error);
      return null;
    }
  }

  async registerDevice(
    userId: string,
    data: {
      fcm_token: string;
      device_type: "android" | "ios" | "web";
      device_name?: string;
    }
  ) {
    const existingDevice = await prisma.userDevice.findFirst({
      where: {
        fcm_token: data.fcm_token,
      },
    });

    if (existingDevice) {
      if (existingDevice.user_id !== userId) {
        // Token belongs to another user, update it
        return await prisma.userDevice.update({
          where: { id: existingDevice.id },
          data: {
            user_id: userId,
            device_type: data.device_type,
            device_name: data.device_name,
            last_used_at: new Date(),
          },
        });
      }
      // Update last used timestamp
      return await prisma.userDevice.update({
        where: { id: existingDevice.id },
        data: { last_used_at: new Date() },
      });
    }

    // Create new device record
    return await prisma.userDevice.create({
      data: {
        user_id: userId,
        fcm_token: data.fcm_token,
        device_type: data.device_type,
        device_name: data.device_name,
      },
    });
  }

  async unregisterDevice(userId: string, fcmToken: string) {
    const device = await prisma.userDevice.findFirst({
      where: {
        user_id: userId,
        fcm_token: fcmToken,
      },
    });

    if (!device) {
      throw new AppError("Device not found", 404);
    }

    await prisma.userDevice.delete({
      where: { id: device.id },
    });

    return { message: "Device unregistered successfully" };
  }
}
