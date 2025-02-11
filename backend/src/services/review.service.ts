// src/services/review.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class ReviewService {
  async createReview(
    customerId: string,
    data: {
      reservation_id: string;
      rating: number;
      comment: string;
      images?: string[];
    }
  ) {
    // Check if reservation exists and belongs to customer
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: data.reservation_id,
        customer_id: customerId,
        status: "COMPLETED",
      },
      include: {
        listing: true,
        review: true,
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found or not completed", 404);
    }

    if (reservation.review) {
      throw new AppError("Review already exists for this reservation", 400);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        customer_id: customerId,
        business_id: reservation.listing.business_id,
        listing_id: reservation.listing_id,
        reservation_id: data.reservation_id,
        rating: data.rating,
        comment: data.comment,
        images: data.images || [],
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        business: true,
        listing: true,
      },
    });

    return review;
  }

  async updateReview(
    reviewId: string,
    customerId: string,
    data: {
      rating?: number;
      comment?: string;
      images?: string[];
    }
  ) {
    // Check if review exists and belongs to customer
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        customer_id: customerId,
      },
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        business: true,
        listing: true,
      },
    });

    return updatedReview;
  }

  async deleteReview(reviewId: string, customerId: string) {
    // Check if review exists and belongs to customer
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        customer_id: customerId,
      },
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async getReview(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        business: true,
        listing: true,
      },
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    return review;
  }

  async getBusinessReviews(
    businessId: string,
    query: {
      page?: number;
      limit?: number;
      minRating?: number;
      maxRating?: number;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      business_id: businessId,
    };

    if (query.minRating || query.maxRating) {
      where.rating = {};
      if (query.minRating) where.rating.gte = query.minRating;
      if (query.maxRating) where.rating.lte = query.maxRating;
    }

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          listing: true,
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

  async getListingReviews(
    listingId: string,
    query: {
      page?: number;
      limit?: number;
      minRating?: number;
      maxRating?: number;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      listing_id: listingId,
    };

    if (query.minRating || query.maxRating) {
      where.rating = {};
      if (query.minRating) where.rating.gte = query.minRating;
      if (query.maxRating) where.rating.lte = query.maxRating;
    }

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
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
      reviews,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}
