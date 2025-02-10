// src/services/food-listing.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class FoodListingService {
  async createListing(
    businessId: string,
    data: {
      title: string;
      description: string;
      price: number;
      original_price: number;
      quantity: number;
      unit: string;
      expiry_date: Date;
      pickup_start: Date;
      pickup_end: Date;
      images: string[];
      is_halal: boolean;
      preparation_time?: string;
      storage_instructions?: string;
      location_id: string;
      category_ids: string[];
    }
  ) {
    // Verify business ownership of location
    const location = await prisma.businessLocation.findFirst({
      where: {
        id: data.location_id,
        business_id: businessId,
      },
    });

    if (!location) {
      throw new AppError("Invalid location", 400);
    }

    // Create listing with categories
    const listing = await prisma.foodListing.create({
      data: {
        ...data,
        business_id: businessId,
        categories: {
          create: data.category_ids.map((categoryId) => ({
            category_id: categoryId,
          })),
        },
      },
      include: {
        business: true,
        location: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return listing;
  }

  async updateListing(
    businessId: string,
    listingId: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      original_price?: number;
      quantity?: number;
      unit?: string;
      expiry_date?: Date;
      pickup_start?: Date;
      pickup_end?: Date;
      images?: string[];
      status?: string;
      is_halal?: boolean;
      preparation_time?: string;
      storage_instructions?: string;
      location_id?: string;
      category_ids?: string[];
    }
  ) {
    // Check if listing exists and belongs to business
    const listing = await prisma.foodListing.findFirst({
      where: {
        id: listingId,
        business_id: businessId,
      },
    });

    if (!listing) {
      throw new AppError("Listing not found", 404);
    }

    // If location is being updated, verify business ownership
    if (data.location_id) {
      const location = await prisma.businessLocation.findFirst({
        where: {
          id: data.location_id,
          business_id: businessId,
        },
      });

      if (!location) {
        throw new AppError("Invalid location", 400);
      }
    }

    // Update listing
    const updateData: any = { ...data };
    delete updateData.category_ids;

    // Start transaction for updating listing and categories
    const updatedListing = await prisma.$transaction(async (prisma) => {
      // Update basic listing data
      const listing = await prisma.foodListing.update({
        where: { id: listingId },
        data: updateData,
      });

      // If category_ids provided, update categories
      if (data.category_ids) {
        // Delete existing categories
        await prisma.listingCategory.deleteMany({
          where: { listing_id: listingId },
        });

        // Create new categories
        await prisma.listingCategory.createMany({
          data: data.category_ids.map((categoryId) => ({
            listing_id: listingId,
            category_id: categoryId,
          })),
        });
      }

      return listing;
    });

    return this.getListing(updatedListing.id);
  }

  async deleteListing(businessId: string, listingId: string) {
    // Check if listing exists and belongs to business
    const listing = await prisma.foodListing.findFirst({
      where: {
        id: listingId,
        business_id: businessId,
      },
    });

    if (!listing) {
      throw new AppError("Listing not found", 404);
    }

    // Check if listing has any active reservations
    const activeReservations = await prisma.reservation.findFirst({
      where: {
        listing_id: listingId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (activeReservations) {
      throw new AppError("Cannot delete listing with active reservations", 400);
    }

    // Delete listing
    await prisma.foodListing.delete({
      where: { id: listingId },
    });
  }

  async getListing(listingId: string) {
    const listing = await prisma.foodListing.findUnique({
      where: { id: listingId },
      include: {
        business: true,
        location: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!listing) {
      throw new AppError("Listing not found", 404);
    }

    return listing;
  }

  async getAllListings(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isHalal?: boolean;
    status?: string;
    businessId?: string;
    locationId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: query.status || "AVAILABLE",
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.category) {
      where.categories = {
        some: {
          category_id: query.category,
        },
      };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }

    if (query.isHalal !== undefined) {
      where.is_halal = query.isHalal;
    }

    if (query.businessId) {
      where.business_id = query.businessId;
    }

    if (query.locationId) {
      where.location_id = query.locationId;
    }

    // Get total count
    const total = await prisma.foodListing.count({ where });

    // Get listings
    const listings = await prisma.foodListing.findMany({
      where,
      include: {
        business: true,
        location: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    });

    return {
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBusinessListings(
    businessId: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
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

    const [total, listings] = await Promise.all([
      prisma.foodListing.count({ where }),
      prisma.foodListing.findMany({
        where,
        include: {
          location: true,
          categories: {
            include: {
              category: true,
            },
          },
          reservations: {
            where: {
              status: {
                in: ["PENDING", "CONFIRMED"],
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
    ]);

    return {
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
