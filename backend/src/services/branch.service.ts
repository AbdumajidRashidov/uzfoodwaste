// src/services/branch.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class BranchService {
  async createBranch(
    businessId: string,
    data: {
      location_id: string;
      name: string;
      branch_code: string;
      description?: string;
      opening_date: Date;
      manager_name: string;
      manager_email: string;
      manager_phone: string;
      operating_hours: any;
      services: string[];
      policies?: any;
    }
  ) {
    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Verify location exists and belongs to business
    const location = await prisma.businessLocation.findFirst({
      where: {
        id: data.location_id,
        business_id: businessId,
      },
    });

    if (!location) {
      throw new AppError(
        "Location not found or doesn't belong to business",
        404
      );
    }

    // Check if branch code is unique
    const existingBranch = await prisma.branch.findUnique({
      where: { branch_code: data.branch_code },
    });

    if (existingBranch) {
      throw new AppError("Branch code already exists", 400);
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        ...data,
        business_id: businessId,
      },
      include: {
        business: true,
        location: true,
      },
    });

    return branch;
  }

  async updateBranch(
    branchId: string,
    businessId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      manager_name?: string;
      manager_email?: string;
      manager_phone?: string;
      operating_hours?: any;
      services?: string[];
      policies?: any;
    }
  ) {
    // Verify branch exists and belongs to business
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        business_id: businessId,
      },
    });

    if (!branch) {
      throw new AppError("Branch not found or doesn't belong to business", 404);
    }

    // Update branch
    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data,
      include: {
        business: true,
        location: true,
      },
    });

    return updatedBranch;
  }

  async getBranch(branchId: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        business: true,
        location: true,
        food_listings: {
          where: {
            status: "AVAILABLE",
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        branch_reviews: {
          include: {
            customer: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 5,
        },
      },
    });

    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    // Calculate average rating
    const avgRating =
      branch.branch_reviews.length > 0
        ? branch.branch_reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / branch.branch_reviews.length
        : 0;

    return {
      ...branch,
      average_rating: avgRating,
      total_reviews: branch.branch_reviews.length,
      active_listings: branch.food_listings.length,
    };
  }

  async getBusinessBranches(
    businessId: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      business_id: businessId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { branch_code: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [total, branches] = await Promise.all([
      prisma.branch.count({ where }),
      prisma.branch.findMany({
        where,
        include: {
          location: true,
          food_listings: {
            where: {
              status: "AVAILABLE",
            },
          },
          branch_reviews: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
    ]);

    // Calculate statistics for each branch
    const branchesWithStats = branches.map((branch) => ({
      ...branch,
      active_listings: branch.food_listings.length,
      average_rating:
        branch.branch_reviews.length > 0
          ? branch.branch_reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / branch.branch_reviews.length
          : 0,
      total_reviews: branch.branch_reviews.length,
    }));

    return {
      branches: branchesWithStats,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async createBranchReview(
    branchId: string,
    customerId: string,
    data: {
      rating: number;
      comment: string;
    }
  ) {
    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    // Check if customer has already reviewed this branch
    const existingReview = await prisma.branchReview.findFirst({
      where: {
        branch_id: branchId,
        customer_id: customerId,
      },
    });

    if (existingReview) {
      throw new AppError("You have already reviewed this branch", 400);
    }

    // Create review
    const review = await prisma.branchReview.create({
      data: {
        branch_id: branchId,
        customer_id: customerId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        customer: true,
      },
    });

    return review;
  }

  async getBranchReviews(
    branchId: string,
    query: {
      page?: number;
      limit?: number;
      rating?: number;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      branch_id: branchId,
    };

    if (query.rating) {
      where.rating = query.rating;
    }

    const [total, reviews] = await Promise.all([
      prisma.branchReview.count({ where }),
      prisma.branchReview.findMany({
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

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getBranchAnalytics(branchId: string, period?: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
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

    // Get date range based on period
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Calculate analytics
    const totalListings = branch.food_listings.length;
    const activeListings = branch.food_listings.filter(
      (l) => l.status === "AVAILABLE"
    ).length;
    const totalReservations = branch.food_listings.reduce(
      (sum, listing) =>
        sum +
        listing.reservations.filter((r) => r.created_at >= startDate).length,
      0
    );
    const completedReservations = branch.food_listings.reduce(
      (sum, listing) =>
        sum +
        listing.reservations.filter(
          (r) => r.status === "COMPLETED" && r.created_at >= startDate
        ).length,
      0
    );
    const averageRating =
      branch.branch_reviews.length > 0
        ? branch.branch_reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / branch.branch_reviews.length
        : 0;

    return {
      total_listings: totalListings,
      active_listings: activeListings,
      total_reservations: totalReservations,
      completed_reservations: completedReservations,
      completion_rate:
        totalReservations > 0
          ? (completedReservations / totalReservations) * 100
          : 0,
      average_rating: averageRating,
      total_reviews: branch.branch_reviews.length,
      period: period || "all",
    };
  }
}
