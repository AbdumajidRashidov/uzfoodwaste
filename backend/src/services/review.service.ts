// src/services/review.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class ReviewService {
  async createReview(
    customerId: string,
    data: {
      reservation_id: string;
      item_reviews: Array<{
        listing_id: string;
        rating: number;
        comment: string;
        images?: string[];
      }>;
    }
  ) {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: data.reservation_id,
        customer_id: customerId,
        status: "COMPLETED",
      },
      include: {
        reservation_items: {
          include: {
            listing: true,
          },
        },
        reviews: true,
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found or not completed", 404);
    }

    if (reservation.reviews.length > 0) {
      throw new AppError("Reviews already exist for this reservation", 400);
    }

    // Validate all items belong to the reservation
    for (const review of data?.item_reviews) {
      const item = reservation.reservation_items.find(
        (i) => i.listing_id === review.listing_id
      );
      if (!item) {
        throw new AppError(`Invalid listing ID: ${review.listing_id}`, 400);
      }
    }

    // Create reviews in transaction
    const reviews = await prisma.$transaction(async (prisma) => {
      const createdReviews = await Promise.all(
        data.item_reviews.map((review) =>
          prisma.review.create({
            data: {
              customer_id: customerId,
              reservation_id: data.reservation_id,
              listing_id: review.listing_id,
              business_id: reservation.reservation_items.find(
                (i) => i.listing_id === review.listing_id
              )!.listing.business_id,
              rating: review.rating,
              comment: review.comment,
              images: review.images || [],
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
              listing: true,
              business: true,
            },
          })
        )
      );

      return createdReviews;
    });

    return reviews;
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
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        customer_id: customerId,
      },
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

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
        listing: true,
        business: true,
      },
    });

    return updatedReview;
  }

  async getBusinessReviews(businessId: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { business_id: businessId };
    if (query.minRating) where.rating = { gte: query.minRating };
    if (query.maxRating)
      where.rating = { ...where.rating, lte: query.maxRating };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          customer: true,
          reservation: {
            include: {
              reservation_items: true,
            },
          },
          listing: true,
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
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

  async deleteReview(reviewId: string, customerId: string) {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        customer_id: customerId,
      },
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: "Review deleted successfully" };
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
        listing: true,
        business: true,
      },
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    return review;
  }
  async getListingReviews(listingId: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { listing_id: listingId };
    if (query.minRating) where.rating = { gte: query.minRating };
    if (query.maxRating)
      where.rating = { ...where.rating, lte: query.maxRating };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          customer: true,
          reservation: {
            include: {
              reservation_items: true,
            },
          },
          listing: true,
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
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
