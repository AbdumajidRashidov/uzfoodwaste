// src/services/admin.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class AdminService {
  async createAdmin(data: {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const admin = await prisma.$transaction(async (prisma) => {
      // Create user with ADMIN role
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          role: "ADMIN",
          is_verified: true, // Admins are verified by default
        },
      });

      // Create admin profile
      await prisma.customer.create({
        data: {
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
        },
      });

      return user;
    });

    return admin;
  }

  async getAllUsers(query: {
    page?: number;
    limit?: number;
    role?: string;
    searchTerm?: string;
    isVerified?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.isVerified !== undefined) {
      where.is_verified = query.isVerified;
    }

    if (query.searchTerm) {
      where.OR = [
        { email: { contains: query.searchTerm, mode: "insensitive" } },
        { phone: { contains: query.searchTerm, mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          customer: true,
          business: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async verifyBusiness(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    return await prisma.business.update({
      where: { id: businessId },
      data: { is_verified: true },
    });
  }

  async getSystemStats() {
    const [
      totalUsers,
      totalBusinesses,
      totalCustomers,
      totalListings,
      totalReservations,
      averageRating,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.customer.count(),
      prisma.foodListing.count(),
      prisma.reservation.count(),
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      total_users: totalUsers,
      total_businesses: totalBusinesses,
      total_customers: totalCustomers,
      total_listings: totalListings,
      total_reservations: totalReservations,
      average_rating: averageRating._avg.rating || 0,
    };
  }
}
