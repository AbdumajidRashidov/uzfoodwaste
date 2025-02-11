// src/services/sms-notification.service.ts
import twilio from "twilio";
import { config } from "../config/environment";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class SMSNotificationService {
  private client: twilio.Twilio | null = null;

  constructor() {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    try {
      // Validate Twilio credentials
      if (
        !config.twilio.accountSid ||
        !config.twilio.accountSid.startsWith("AC")
      ) {
        console.warn(
          "Invalid or missing Twilio Account SID. SMS features will be disabled."
        );
        return;
      }

      if (!config.twilio.authToken) {
        console.warn(
          "Missing Twilio Auth Token. SMS features will be disabled."
        );
        return;
      }

      if (!config.twilio.phoneNumber) {
        console.warn(
          "Missing Twilio Phone Number. SMS features will be disabled."
        );
        return;
      }

      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    } catch (error) {
      console.error("Twilio initialization error:", error);
      this.client = null;
    }
  }

  async sendSMS(userId: string, message: string) {
    try {
      if (!this.client) {
        console.warn(
          "SMS service is not properly configured. Message not sent."
        );
        return null;
      }

      // Get user's phone number
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (!user?.phone) {
        console.log("User has no phone number registered");
        return null;
      }

      // Ensure phone number exists and is formatted correctly
      const phoneNumber = this.formatPhoneNumber(user.phone);
      if (!phoneNumber) {
        console.log("Invalid phone number format");
        return null;
      }

      // Send SMS
      const response = await this.client.messages.create({
        body: message,
        to: phoneNumber,
        from: config.twilio.phoneNumber,
      });

      // Log SMS notification
      await prisma.smsNotificationLog.create({
        data: {
          user_id: userId,
          message: message,
          twilio_message_id: response.sid,
          status: response.status,
        },
      });

      return response;
    } catch (error) {
      console.error("SMS notification error:", error);
      return null;
    }
  }

  async verifyPhoneNumber(userId: string, phoneNumber: string) {
    try {
      if (!this.client || !config.twilio.verifyServiceSid) {
        throw new AppError(
          "SMS verification service is not properly configured",
          503
        );
      }

      // Ensure phone number is formatted correctly
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        throw new AppError("Invalid phone number format", 400);
      }

      // Start verification
      const verification = await this.client.verify.v2
        .services(config.twilio.verifyServiceSid)
        .verifications.create({
          to: formattedPhone,
          channel: "sms",
        });

      return verification;
    } catch (error) {
      console.error("Phone verification error:", error);
      throw error;
    }
  }

  async checkVerificationCode(
    userId: string,
    phoneNumber: string,
    code: string
  ) {
    try {
      if (!this.client || !config.twilio.verifyServiceSid) {
        throw new AppError(
          "SMS verification service is not properly configured",
          503
        );
      }

      // Ensure phone number is formatted correctly
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        throw new AppError("Invalid phone number format", 400);
      }

      const verificationCheck = await this.client.verify.v2
        .services(config.twilio.verifyServiceSid)
        .verificationChecks.create({
          to: formattedPhone,
          code: code,
        });

      if (verificationCheck.status === "approved") {
        // Update user's phone number
        await prisma.user.update({
          where: { id: userId },
          data: {
            phone: formattedPhone,
            phone_verified: true,
          },
        });
      }

      return verificationCheck;
    } catch (error) {
      console.error("Verification check error:", error);
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string | null {
    try {
      // Remove any non-digit characters
      const cleaned = phone.replace(/\D/g, "");

      // Check if the number starts with '+' and has the correct format
      if (phone.startsWith("+") && /^\+[1-9]\d{1,14}$/.test(phone)) {
        return phone;
      }

      // If it's just digits and has a valid length (assuming minimum 10 digits)
      if (cleaned.length >= 10) {
        // Add '+' prefix if missing
        return `+${cleaned}`;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
