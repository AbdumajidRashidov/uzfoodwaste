import { excludeSensitiveFields } from "./../utils/user.util";
// src/services/admin.service.ts
import { PrismaClient, Category } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import bcrypt from "bcryptjs";
// import _ from "lodash";

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
          is_verified: true,
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
      const sanitizedUser = excludeSensitiveFields(user);
      return sanitizedUser;
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
    const sanitizedUser = excludeSensitiveFields(users);
    return {
      sanitizedUser,
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

  async createCategory(data: {
    name: string;
    description: string;
    icon: string;
  }): Promise<Category> {
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new AppError("Category with this name already exists", 400);
    }

    return await prisma.category.create({
      data,
    });
  }

  async updateCategory(
    categoryId: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
    }
  ): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (data.name && data.name !== category.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (existingCategory) {
        throw new AppError("Category with this name already exists", 400);
      }
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        listings: true,
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (category.listings.length > 0) {
      throw new AppError(
        "Cannot delete category that is being used by listings",
        400
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async getDetailedSystemStats() {
    const [
      totalUsers,
      totalBusinesses,
      totalCustomers,
      totalListings,
      totalReservations,
      averageRating,
      userStats,
      businessStats,
      listingStats,
      reservationStats,
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
      // User statistics
      prisma.user.groupBy({
        by: ["role", "is_verified"],
        _count: true,
      }),
      // Business statistics
      prisma.business.groupBy({
        by: ["is_verified"],
        _count: true,
      }),
      // Listing statistics
      prisma.foodListing.groupBy({
        by: ["status"],
        _count: true,
        _avg: {
          price: true,
          original_price: true,
        },
      }),
      // Reservation statistics
      prisma.reservation.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    return {
      overview: {
        total_users: totalUsers,
        total_businesses: totalBusinesses,
        total_customers: totalCustomers,
        total_listings: totalListings,
        total_reservations: totalReservations,
        average_rating: averageRating._avg.rating || 0,
      },
      user_stats: {
        by_role: userStats,
        verification_rate:
          (userStats.filter((s) => s.is_verified).length / userStats.length) *
          100,
      },
      business_stats: {
        verification_data: businessStats,
        verification_rate:
          ((businessStats.find((s) => s.is_verified)?._count || 0) /
            totalBusinesses) *
          100,
      },
      listing_stats: {
        by_status: listingStats,
        average_discount_rate: listingStats.reduce((acc, curr) => {
          const avgDiscount =
            (((Number(curr._avg.original_price) || 0) -
              (Number(curr._avg.price) || 0)) /
              (Number(curr._avg.original_price) || 1)) *
            100;
          return acc + avgDiscount * (curr._count / totalListings);
        }, 0),
      },
      reservation_stats: {
        by_status: reservationStats,
        completion_rate:
          ((reservationStats.find((s) => s.status === "COMPLETED")?._count ||
            0) /
            totalReservations) *
          100,
      },
    };
  }

  async getBusinessAnalytics(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        food_listings: {
          include: {
            reservations: true,
            reviews: true,
          },
        },
        reviews: true,
        locations: true,
      },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    const totalListings = business.food_listings.length;
    const activeListings = business.food_listings.filter(
      (l) => l.status === "AVAILABLE"
    ).length;
    const totalReservations = business.food_listings.reduce(
      (acc, l) => acc + l.reservations.length,
      0
    );
    const completedReservations = business.food_listings.reduce(
      (acc, l) =>
        acc + l.reservations.filter((r) => r.status === "COMPLETED").length,
      0
    );
    const averageRating =
      business.reviews.reduce((acc, r) => acc + r.rating, 0) /
        business.reviews.length || 0;

    return {
      business_info: {
        id: business.id,
        company_name: business.company_name,
        is_verified: business.is_verified,
        total_locations: business.locations.length,
      },
      performance_metrics: {
        totalListings,
        activeListings,
        totalReservations,
        completedReservations,
        completion_rate: (completedReservations / totalReservations) * 100,
        average_rating: averageRating,
        total_reviews: business.reviews.length,
      },
      listing_performance: business.food_listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        reservations: listing.reservations.length,
        average_rating:
          listing.reviews.reduce((acc, r) => acc + r.rating, 0) /
            listing.reviews.length || 0,
        discount_rate:
          ((listing.original_price.toNumber() - listing.price.toNumber()) /
            listing.original_price.toNumber()) *
          100,
      })),
    };
  }

  async bulkUpdateBusinessVerification(data: {
    business_ids: string[];
    is_verified: boolean;
  }) {
    return await prisma.business.updateMany({
      where: {
        id: {
          in: data.business_ids,
        },
      },
      data: {
        is_verified: data.is_verified,
      },
    });
  }

  async manageFoodListings(data: {
    business_id?: string;
    status?: string;
    action: "ACTIVATE" | "DEACTIVATE" | "DELETE";
    listing_ids: string[];
  }) {
    const where: any = {
      id: {
        in: data.listing_ids,
      },
    };

    if (data.business_id) {
      where.business_id = data.business_id;
    }

    switch (data.action) {
      case "ACTIVATE":
        return await prisma.foodListing.updateMany({
          where,
          data: { status: "AVAILABLE" },
        });

      case "DEACTIVATE":
        return await prisma.foodListing.updateMany({
          where,
          data: { status: "UNAVAILABLE" },
        });

      case "DELETE":
        // Check for active reservations first
        const listingsWithReservations = await prisma.foodListing.findMany({
          where,
          include: {
            reservations: {
              where: {
                status: {
                  in: ["PENDING", "CONFIRMED"],
                },
              },
            },
          },
        });

        const hasActiveReservations = listingsWithReservations.some(
          (listing) => listing.reservations.length > 0
        );

        if (hasActiveReservations) {
          throw new AppError(
            "Cannot delete listings with active reservations",
            400
          );
        }

        return await prisma.foodListing.deleteMany({ where });
    }
  }

  async getUserAnalytics() {
    const [users, customers, businesses] = await Promise.all([
      prisma.user.findMany(),
      prisma.customer.findMany({
        include: {
          user: true,
          reservations: true,
          reviews: true,
        },
      }),
      prisma.business.findMany({
        include: {
          user: true,
          food_listings: true,
          reviews: {
            include: {
              customer: true,
            },
          },
        },
      }),
    ]);

    // Calculate user engagement metrics
    const customerEngagement = customers.map((customer) => ({
      customer_id: customer.id,
      total_reservations: customer.reservations.length,
      total_reviews: customer.reviews.length,
      user_verified: customer.user.is_verified,
    }));

    const businessEngagement = businesses.map((business) => ({
      business_id: business.id,
      total_listings: business.food_listings.length,
      average_rating:
        business.reviews.reduce((acc, r) => acc + r.rating, 0) /
          business.reviews.length || 0,
      user_verified: business.user.is_verified,
    }));

    return {
      user_overview: {
        total_users: users.length,
        verified_users: users.filter((u) => u.is_verified).length,
        customer_count: customers.length,
        business_count: businesses.length,
      },
      customer_metrics: {
        engagement: customerEngagement,
        average_reservations_per_customer:
          customers.reduce((acc, c) => acc + c.reservations.length, 0) /
            customers.length || 0,
        average_reviews_per_customer:
          customers.reduce((acc, c) => acc + c.reviews.length, 0) /
            customers.length || 0,
      },
      business_metrics: {
        engagement: businessEngagement,
        average_listings_per_business:
          businesses.reduce((acc, b) => acc + b.food_listings.length, 0) /
            businesses.length || 0,
        verification_rate:
          (businesses.filter((b) => b.user.is_verified).length /
            businesses.length) *
          100,
      },
    };
  }
}
