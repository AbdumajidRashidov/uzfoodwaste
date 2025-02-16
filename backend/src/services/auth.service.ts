// src/services/auth.service.ts
import * as crypto from "crypto";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import appleSignin from "apple-signin-auth";
import { config } from "../config/environment";
import { AppError } from "../middlewares/error.middleware";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { EmailService } from "./email.service";
import { TelegramService } from "./telegram.service";

const emailService = new EmailService();

const googleClient = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret
);

const prisma = new PrismaClient();

export class AuthService {
  private generateToken(userId: string) {
    return jwt.sign(
      { id: userId },
      config.jwtSecret as jwt.Secret,
      {
        expiresIn: config.jwtExpiresIn,
      } as jwt.SignOptions
    );
  }
  async register(userData: {
    email: string;
    password: string;
    phone: string;
    role: "CUSTOMER" | "BUSINESS" | "ADMIN";
    firstName?: string;
    lastName?: string;
    companyName?: string;
    legalName?: string;
    taxNumber?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          phone: userData.phone,
          role: userData.role,
        },
      });

      // Create associated profile based on role
      if (
        userData.role === "CUSTOMER" &&
        userData.firstName &&
        userData.lastName
      ) {
        await prisma.customer.create({
          data: {
            user_id: user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        });
      } else if (
        userData.role === "BUSINESS" &&
        userData.companyName &&
        userData.legalName &&
        userData.taxNumber
      ) {
        await prisma.business.create({
          data: {
            user_id: user.id,
            company_name: userData.companyName,
            legal_name: userData.legalName,
            tax_number: userData.taxNumber,
            business_license: "", // Required fields that should be updated later
            business_type: "", // Required fields that should be updated later
            registration_number: "", // Required fields that should be updated later
            verification_documents: "", // Required fields that should be updated later
            working_hours: "", // Required fields that should be updated later
          },
        });
      }

      return user;
    });

    // Generate token
    const token = this.generateToken(result.id);

    return { token, user: result };
  }
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    };
  }
  async verifyGoogleToken(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError("Invalid Google token", 401);
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        // Create new user
        const result = await prisma.$transaction(async (prisma) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: payload.email!,
              password: "", // Google auth doesn't need password
              phone: "", // Will need to be updated later
              role: "CUSTOMER", // Default role
              is_verified: true, // Google verified email
            },
          });

          // Create customer profile
          await prisma.customer.create({
            data: {
              user_id: user.id,
              first_name: payload.given_name || "",
              last_name: payload.family_name || "",
              profile_picture: payload.picture,
            },
          });

          return user;
        });

        user = result;
      }

      // Generate token
      const jwtToken = this.generateToken(user.id);

      return {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
        },
      };
    } catch (error) {
      throw new AppError("Invalid Google token", 401);
    }
  }
  async verifyAppleToken(
    idToken: string,
    userInfo?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    }
  ) {
    try {
      // Verify the Apple ID token
      const appleUser = await appleSignin.verifyIdToken(idToken, {
        audience: config.apple.clientId, // Your Apple Service ID
        ignoreExpiration: false,
      });

      if (!appleUser.email) {
        throw new AppError("Email not found in Apple token", 401);
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: appleUser.email },
      });

      if (!user) {
        // Create new user
        const result = await prisma.$transaction(async (prisma) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: appleUser.email!,
              password: "", // Apple auth doesn't need password
              phone: "", // Will need to be updated later
              role: "CUSTOMER", // Default role
              is_verified: true, // Apple verified email
            },
          });

          // Create customer profile
          await prisma.customer.create({
            data: {
              user_id: user.id,
              first_name: userInfo?.firstName || "",
              last_name: userInfo?.lastName || "",
            },
          });

          return user;
        });

        user = result;
      }

      // Generate token
      const token = this.generateToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
        },
      };
    } catch (error) {
      console.error("Apple auth error:", error);
      throw new AppError("Invalid Apple token", 401);
    }
  }
  async forgotPassword(email: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("No user found with that email address", 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: passwordResetToken,
        password_reset_expires: passwordResetExpires,
      },
    });

    try {
      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      return {
        status: "success",
        message: "Password reset link sent to email",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      // If email fails, remove reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_reset_token: null,
          password_reset_expires: null,
        },
      });

      throw new AppError(
        "Error sending password reset email. Please try again.",
        500
      );
    }
  }
  async resetPassword(token: string, newPassword: string) {
    // Hash the token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError("Invalid or expired password reset token", 400);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
      },
    });

    return {
      status: "success",
      message: "Password successfully reset",
    };
  }
  async startTelegramVerification(userId: string) {
    const telegramService = await TelegramService.getInstance();
    const botLink = await telegramService.startVerification(userId);

    return {
      bot_link: botLink,
      expires_in: 1800, // 30 minutes in seconds
    };
  }

  async getTelegramVerificationStatus(userId: string) {
    const telegramService = await TelegramService.getInstance();
    return await telegramService.getVerificationStatus(userId);
  }
}
