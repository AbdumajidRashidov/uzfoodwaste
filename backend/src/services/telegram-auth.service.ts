// src/services/telegram-auth.service.ts
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/environment";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export class TelegramAuthService {
  private botToken: string;

  constructor() {
    if (!config.telegram.botToken) {
      throw new Error("Telegram bot token is not configured");
    }
    this.botToken = config.telegram.botToken;
  }

  private validateAuthData(authData: TelegramAuthData): boolean {
    const { hash, ...data } = authData;

    // Create a sorted string of key=value pairs
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key as keyof typeof data]}`)
      .join("\n");

    // Create secret key from bot token
    const secretKey = crypto
      .createHash("sha256")
      .update(this.botToken)
      .digest();

    // Calculate and verify hash
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return calculatedHash === hash;
  }

  async authenticateUser(authData: TelegramAuthData) {
    // Validate auth data
    if (!this.validateAuthData(authData)) {
      throw new AppError("Invalid authentication data", 401);
    }

    // Check auth_date (prevent replay attacks)
    const authTimestamp = authData.auth_date * 1000; // Convert to milliseconds
    const now = Date.now();
    if (now - authTimestamp > 86400000) {
      // 24 hours
      throw new AppError("Authentication data expired", 401);
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        telegram_id: authData.id.toString(),
      },
    });

    if (!user) {
      // Create new user
      const result = await prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: `${authData.id}@telegram.user`, // Placeholder email
            password: "", // No password for Telegram auth
            phone: "", // Will be updated later
            role: "CUSTOMER", // Default role
            is_verified: true, // Telegram verified
            telegram_id: authData.id.toString(),
            telegram_username: authData.username,
            telegram_photo: authData.photo_url,
          },
        });

        // Create customer profile
        await prisma.customer.create({
          data: {
            user_id: user.id,
            first_name: authData.first_name || "",
            last_name: authData.last_name || "",
            profile_picture: authData.photo_url,
          },
        });

        return user;
      });

      user = result;
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        role: user.role,
        is_verified: user.is_verified,
      },
    };
  }

  private generateToken(userId: string): string {
    // Implement your JWT token generation here
    // You can reuse the existing token generation logic
    return "token";
  }
}

export const telegramAuthService = new TelegramAuthService();
