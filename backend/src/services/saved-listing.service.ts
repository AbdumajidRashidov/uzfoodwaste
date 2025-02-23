// src/services/saved-listing.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class SavedListingService {
  async saveListing(
    customerId: string,
    listingId: string,
    data?: {
      notes?: string;
      notification_enabled?: boolean;
    }
  ) {
    // Check if listing exists
    const listing = await prisma.foodListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new AppError("Food listing not found", 404);
    }

    // Check if already saved
    const existingSave = await prisma.savedListing.findUnique({
      where: {
        customer_id_listing_id: {
          customer_id: customerId,
          listing_id: listingId,
        },
      },
    });

    if (existingSave) {
      throw new AppError("Listing already saved", 400);
    }

    // Save listing
    const savedListing = await prisma.savedListing.create({
      data: {
        customer_id: customerId,
        listing_id: listingId,
        notes: data?.notes,
        notification_enabled: data?.notification_enabled ?? true,
      },
      include: {
        listing: {
          include: {
            business: true,
            branch: {
              include: {
                location: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return savedListing;
  }

  async unsaveListing(customerId: string, listingId: string) {
    // Check if saved listing exists
    const savedListing = await prisma.savedListing.findUnique({
      where: {
        customer_id_listing_id: {
          customer_id: customerId,
          listing_id: listingId,
        },
      },
    });

    if (!savedListing) {
      throw new AppError("Saved listing not found", 404);
    }

    // Delete saved listing
    await prisma.savedListing.delete({
      where: {
        customer_id_listing_id: {
          customer_id: customerId,
          listing_id: listingId,
        },
      },
    });
  }

  async updateSavedListing(
    customerId: string,
    listingId: string,
    data: {
      notes?: string;
      notification_enabled?: boolean;
    }
  ) {
    // Check if saved listing exists
    const savedListing = await prisma.savedListing.findUnique({
      where: {
        customer_id_listing_id: {
          customer_id: customerId,
          listing_id: listingId,
        },
      },
    });

    if (!savedListing) {
      throw new AppError("Saved listing not found", 404);
    }

    // Update saved listing
    const updatedListing = await prisma.savedListing.update({
      where: {
        customer_id_listing_id: {
          customer_id: customerId,
          listing_id: listingId,
        },
      },
      data,
      include: {
        listing: {
          include: {
            business: true,
            branch: {
              include: {
                location: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return updatedListing;
  }

  async getSavedListings(
    customerId: string,
    query: {
      page?: number;
      limit?: number;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [total, savedListings] = await Promise.all([
      prisma.savedListing.count({
        where: { customer_id: customerId },
      }),
      prisma.savedListing.findMany({
        where: { customer_id: customerId },
        include: {
          listing: {
            include: {
              business: true,
              branch: {
                include: {
                  location: true,
                },
              },
              categories: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          saved_at: "desc",
        },
      }),
    ]);

    return {
      saved_listings: savedListings,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async checkSavedStatus(customerId: string, listingId: string) {
    const savedListing = await prisma.savedListing.findUnique({
      where: {
        customer_id_listing_id: {
          customer_id: customerId,
          listing_id: listingId,
        },
      },
    });

    return !!savedListing;
  }
}
