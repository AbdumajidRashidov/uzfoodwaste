// src/services/branch-manager.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { EmailService } from "./email.service";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();
const emailService = new EmailService();

export class BranchManagerService {
  private generateTempPassword(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  async getProfile(managerId: string) {
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "BRANCH_MANAGER",
      },
      include: {
        customer: true,
      },
    });

    if (!manager) {
      throw new AppError("Branch manager not found", 404);
    }

    // Get associated branch
    const branch = await prisma.branch.findFirst({
      where: {
        manager_email: manager.email,
      },
      include: {
        business: true,
        location: true,
      },
    });

    return {
      personal_info: {
        id: manager.id,
        email: manager.email,
        phone: manager.phone,
        first_name: manager.customer?.first_name,
        last_name: manager.customer?.last_name,
      },
      branch_info: branch,
    };
  }

  async updateProfile(
    managerId: string,
    data: {
      phone?: string;
      first_name?: string;
      last_name?: string;
    }
  ) {
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "BRANCH_MANAGER",
      },
      include: {
        customer: true,
      },
    });

    if (!manager) {
      throw new AppError("Branch manager not found", 404);
    }

    // Update in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id: managerId },
        data: {
          phone: data.phone,
        },
      });

      // Update customer profile
      if (data.first_name || data.last_name) {
        await prisma.customer.update({
          where: { user_id: managerId },
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
          },
        });
      }

      // Update branch manager info if name changed
      if (data.first_name || data.last_name) {
        const fullName = `${data.first_name || manager.customer?.first_name} ${
          data.last_name || manager.customer?.last_name
        }`;
        await prisma.branch.updateMany({
          where: { manager_email: manager.email },
          data: { manager_name: fullName },
        });
      }

      return this.getProfile(managerId);
    });

    return result;
  }

  async getBranchStats(managerId: string) {
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "BRANCH_MANAGER",
      },
    });

    if (!manager) {
      throw new AppError("Branch manager not found", 404);
    }

    const branch = await prisma.branch.findFirst({
      where: {
        manager_email: manager.email,
      },
      include: {
        food_listings: {
          include: {
            reservations: true,
          },
        },
        branch_reviews: true,
      },
    });

    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    const stats = {
      total_listings: branch.food_listings.length,
      active_listings: branch.food_listings.filter(
        (l) => l.status === "AVAILABLE"
      ).length,
      total_reservations: branch.food_listings.reduce(
        (sum, listing) => sum + listing.reservations.length,
        0
      ),
      average_rating:
        branch.branch_reviews.length > 0
          ? branch.branch_reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / branch.branch_reviews.length
          : 0,
      total_reviews: branch.branch_reviews.length,
    };

    return stats;
  }

  async updateBranchSettings(
    managerId: string,
    data: {
      operating_hours?: any;
      services?: string[];
      policies?: any;
    }
  ) {
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "BRANCH_MANAGER",
      },
    });

    if (!manager) {
      throw new AppError("Branch manager not found", 404);
    }

    const updatedBranch = await prisma.branch.updateMany({
      where: {
        manager_email: manager.email,
      },
      data: {
        operating_hours: data.operating_hours,
        services: data.services,
        policies: data.policies,
      },
    });

    return this.getProfile(managerId);
  }

  async getBranchManagers(query: {
    page?: number;
    limit?: number;
    businessId?: string;
    branchId?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      role: "BRANCH_MANAGER",
    };

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { first_name: { contains: query.search, mode: "insensitive" } },
              { last_name: { contains: query.search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [total, managers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          customer: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
    ]);

    // Get branch information for each manager
    const managersWithBranch = await Promise.all(
      managers.map(async (manager) => {
        const branch = await prisma.branch.findFirst({
          where: { manager_email: manager.email },
          include: {
            business: true,
            location: true,
          },
        });

        return {
          ...manager,
          branch,
        };
      })
    );

    return {
      data: managersWithBranch,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async resetManagerPassword(managerId: string) {
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "BRANCH_MANAGER",
      },
    });

    if (!manager) {
      throw new AppError("Branch manager not found", 404);
    }

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: managerId },
      data: { password: hashedPassword },
    });

    // Send password reset email
    await emailService.sendPasswordResetNotification(manager.email, {
      name: manager.telegram_username || "",
      email: manager.email,
      newPassword: tempPassword,
    });

    return {
      message:
        "Password reset successful. New password sent to manager's email.",
    };
  }

  async updateManagerStatus(managerId: string, status: "ACTIVE" | "INACTIVE") {
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "BRANCH_MANAGER",
      },
    });

    if (!manager) {
      throw new AppError("Branch manager not found", 404);
    }

    // Update user and branch status in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update user is_verified status
      await prisma.user.update({
        where: { id: managerId },
        data: { is_verified: status === "ACTIVE" },
      });

      // Update branch status
      await prisma.branch.updateMany({
        where: { manager_email: manager.email },
        data: { status },
      });

      return this.getProfile(managerId);
    });

    return result;
  }
}
