// src/services/referral.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import crypto from "crypto";

const prisma = new PrismaClient();

export class ReferralService {
  private generateReferralCode(length: number = 8): string {
    // Generate a random code using crypto
    const bytes = crypto.randomBytes(Math.ceil(length / 2));
    return bytes.toString("hex").slice(0, length).toUpperCase();
  }

  async createReferralCode(
    userId: string,
    data?: {
      usage_limit?: number;
      reward_points?: number;
      expires_at?: Date;
    }
  ) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate a unique referral code
    let code: string;
    let isUnique = false;

    do {
      code = this.generateReferralCode();
      const existing = await prisma.referralCode.findUnique({
        where: { code },
      });
      isUnique = !existing;
    } while (!isUnique);

    // Create referral code
    const referralCode = await prisma.referralCode.create({
      data: {
        user_id: userId,
        code,
        usage_limit: data?.usage_limit ?? 10,
        reward_points: data?.reward_points ?? 100,
        expires_at: data?.expires_at,
      },
    });

    return referralCode;
  }

  async applyReferralCode(userId: string, code: string) {
    // Start transaction
    return await prisma.$transaction(async (prisma) => {
      // Find referral code
      const referralCode = await prisma.referralCode.findUnique({
        where: { code },
        include: {
          user: true,
        },
      });

      if (!referralCode) {
        throw new AppError("Invalid referral code", 400);
      }

      // Check if code is expired
      if (referralCode.expires_at && referralCode.expires_at < new Date()) {
        throw new AppError("Referral code has expired", 400);
      }

      // Check if code has reached usage limit
      if (referralCode.times_used >= referralCode.usage_limit) {
        throw new AppError("Referral code has reached its usage limit", 400);
      }

      // Check if user is trying to use their own code
      if (referralCode.user_id === userId) {
        throw new AppError("Cannot use your own referral code", 400);
      }

      // Check if user has already used a referral code
      const existingUse = await prisma.referralUse.findUnique({
        where: { referred_user_id: userId },
      });

      if (existingUse) {
        throw new AppError("You have already used a referral code", 400);
      }

      // Create referral use record
      const referralUse = await prisma.referralUse.create({
        data: {
          referral_code_id: referralCode.id,
          referred_user_id: userId,
          referrer_user_id: referralCode.user_id,
          points_awarded: referralCode.reward_points,
        },
      });

      // Update referral code usage count
      await prisma.referralCode.update({
        where: { id: referralCode.id },
        data: { times_used: { increment: 1 } },
      });

      // Award points to both users
      // For referrer
      await prisma.userPoints.upsert({
        where: { user_id: referralCode.user_id },
        create: {
          user_id: referralCode.user_id,
          points_balance: referralCode.reward_points,
        },
        update: {
          points_balance: { increment: referralCode.reward_points },
        },
      });

      // For referred user
      await prisma.userPoints.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          points_balance: referralCode.reward_points,
        },
        update: {
          points_balance: { increment: referralCode.reward_points },
        },
      });

      return referralUse;
    });
  }

  async getUserReferrals(userId: string) {
    const referrals = await prisma.referralUse.findMany({
      where: { referrer_user_id: userId },
      include: {
        referred_user: {
          select: {
            email: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const stats = {
      total_referrals: referrals.length,
      total_points_earned: referrals.reduce(
        (sum, ref) => sum + ref.points_awarded,
        0
      ),
    };

    return { referrals, stats };
  }

  async getUserPoints(userId: string) {
    const points = await prisma.userPoints.findUnique({
      where: { user_id: userId },
    });

    return points || { user_id: userId, points_balance: 0 };
  }
}
