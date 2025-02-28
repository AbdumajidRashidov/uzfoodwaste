// src/services/food-listing.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import {
  calculateRemainingHours,
  formatRemainingTime,
  isPickupUrgent,
  getPickupTimeStatus,
} from "../utils/time.util";

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
      categories: string[];
      branch_id: string;
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

    // Verify business ownership of location
    const branch = await prisma.branch.findFirst({
      where: {
        id: data.branch_id,
        business_id: businessId,
      },
    });

    if (!branch) {
      throw new AppError("Invalid Branch", 400);
    }

    // Create listing with categories in a transaction
    const listing = await prisma.$transaction(async (tx) => {
      // First create the listing
      const newListing = await tx.foodListing.create({
        data: {
          business_id: businessId,
          title: data.title,
          description: data.description,
          price: data.price,
          original_price: data.original_price,
          quantity: data.quantity,
          unit: data.unit,
          expiry_date: data.expiry_date,
          pickup_start: data.pickup_start,
          pickup_end: data.pickup_end,
          images: data.images,
          is_halal: data.is_halal,
          preparation_time: data.preparation_time,
          storage_instructions: data.storage_instructions,
          location_id: data.location_id,
          branch_id: data.branch_id,
          categories: {
            create: data.categories.map((categoryId) => ({
              category: {
                connect: {
                  id: categoryId,
                },
              },
            })),
          },
        },
        include: {
          business: true,
          location: true,
          branch: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return newListing;
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
      categories?: string[];
      branch_id?: string; // New field for branch
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

    // If branch is being updated, verify it belongs to the business
    if (data.branch_id) {
      const branch = await prisma.branch.findFirst({
        where: {
          id: data.branch_id,
          business_id: businessId,
          location_id: data.location_id || listing.location_id,
          status: "ACTIVE",
        },
      });

      if (!branch) {
        throw new AppError("Invalid or inactive branch", 400);
      }
    }

    // Update listing
    const updateData: any = { ...data };
    delete updateData.categories;

    // Start transaction for updating listing and categories
    const updatedListing = await prisma.$transaction(async (prisma) => {
      // Update basic listing data
      const listing = await prisma.foodListing.update({
        where: { id: listingId },
        data: updateData,
      });

      // If categories provided, update categories
      if (data.categories) {
        // Delete existing categories
        await prisma.listingCategory.deleteMany({
          where: { listing_id: listingId },
        });

        // Create new categories
        await prisma.listingCategory.createMany({
          data: data.categories.map((categoryId) => ({
            listing_id: listingId,
            category_id: categoryId,
          })),
        });
      }

      return listing;
    });

    return this.getListing(updatedListing.id);
  }

  async getListing(listingId: string) {
    const listing = await prisma.foodListing.findUnique({
      where: { id: listingId },
      include: {
        business: true,
        location: true,
        branch: true,
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

    if (listing) {
      const remainingHours = calculateRemainingHours(listing.pickup_end);
      const formattedTime = formatRemainingTime(remainingHours);
      const isUrgent = isPickupUrgent(listing.pickup_end);
      const status = getPickupTimeStatus(listing.pickup_end);

      return {
        ...listing,
        remaining_pickup_hours: remainingHours,
        pickup_status: status,
        formatted_time: formattedTime,
        is_urgent: isUrgent,
      };
    }
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
    branchId?: string;
    prioritizeUrgent?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: query.status || "AVAILABLE",
      quantity: { not: 0 },
    };

    // Search filter
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Price range filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    // Halal status filter
    if (query.isHalal !== undefined) {
      where.is_halal = query.isHalal;
    }

    // Business, location, and branch filters
    if (query.businessId) {
      where.business_id = query.businessId;
    }

    if (query.locationId) {
      where.location_id = query.locationId;
    }

    if (query.branchId) {
      where.branch_id = query.branchId;
    }

    // Category filter
    if (query.category) {
      where.categories = {
        some: {
          category_id: query.category,
        },
      };
    }

    // Define the order by clause
    let orderBy: any[] = [];

    // Prioritize urgent listings if requested
    if (query.prioritizeUrgent) {
      orderBy.push(
        {
          pickup_status: {
            // Order by pickup status with "urgent" first
            equals: "urgent",
            sort: "asc",
          },
        },
        {
          pickup_end: "asc", // Then by closest pickup deadline
        }
      );
    }

    // Always add created_at as the final sorting criteria
    orderBy.push({ created_at: "desc" });

    const [total, listings] = await Promise.all([
      prisma.foodListing.count({ where }),
      prisma.foodListing.findMany({
        where,
        include: {
          business: true,
          location: true,
          branch: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    // Update pickup statuses
    const updatedListings = await Promise.all(
      listings.map(async (listing) => {
        const status = getPickupTimeStatus(listing.pickup_end);
        if (status !== listing.pickup_status) {
          await prisma.foodListing.update({
            where: { id: listing.id },
            data: { pickup_status: status },
          });
        }

        return {
          ...listing,
          remaining_pickup_hours: calculateRemainingHours(listing.pickup_end),
        };
      })
    );

    return {
      listings: updatedListings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteListing(businessId: string, listingId: string) {
    // Check if listing exists and belongs to business
    const listing = await prisma.foodListing.findFirst({
      where: {
        id: listingId,
        business_id: businessId,
      },
      include: {
        branch: true,
      },
    });

    if (!listing) {
      throw new AppError("Listing not found", 404);
    }

    // If listing belongs to a branch, verify branch is active
    if (listing.branch_id) {
      const branch = await prisma.branch.findFirst({
        where: {
          id: listing.branch_id,
          status: "ACTIVE",
        },
      });

      if (!branch) {
        throw new AppError("Cannot delete listing from inactive branch", 400);
      }
    }

    // Check if listing has any active reservations
    const activeReservations = await prisma.reservation.findFirst({
      where: {
        foodListingId: listingId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (activeReservations) {
      throw new AppError("Cannot delete listing with active reservations", 400);
    }

    await prisma.listingCategory.deleteMany({
      where: {
        listing_id: listingId,
      },
    });

    // Delete listing
    await prisma.foodListing.delete({
      where: { id: listingId },
    });
  }

  async getBusinessListings(
    businessId: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      branchId?: string; // Add branch filter
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

    if (query.branchId) {
      where.branch_id = query.branchId;
    }

    const [total, listings] = await Promise.all([
      prisma.foodListing.count({ where }),
      prisma.foodListing.findMany({
        where,
        include: {
          location: true,
          branch: true, // Include branch information
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

    // Add branch-specific statistics if listing belongs to a branch
    const listingsWithStats = listings.map((listing) => {
      const stats = {
        active_reservations: listing.reservations.length,
        branch_name: listing.branch?.name || null,
        branch_status: listing.branch?.status || null,
      };

      return {
        ...listing,
        stats,
      };
    });

    return {
      listings: listingsWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePickupStatuses() {
    const listings = await prisma.foodListing.findMany({
      where: {
        status: "AVAILABLE",
        pickup_status: { not: "expired" },
      },
      include: {
        branch: true, // Include branch to check its status
      },
    });

    for (const listing of listings) {
      const status = getPickupTimeStatus(listing.pickup_end);

      // Check if status needs to be updated
      if (status !== listing.pickup_status) {
        const updateData: any = { pickup_status: status };

        // If listing is expired, update status
        if (status === "expired") {
          updateData.status = "UNAVAILABLE";
        }

        // If listing belongs to a branch and branch is inactive,
        // make sure listing is marked as unavailable
        if (listing.branch && listing.branch.status === "INACTIVE") {
          updateData.status = "UNAVAILABLE";
        }

        await prisma.foodListing.update({
          where: { id: listing.id },
          data: updateData,
        });
      }
    }
  }
}
