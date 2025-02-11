// src/services/listing-category.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class ListingCategoryService {
  async addCategoriesToListing(
    businessId: string,
    listingId: string,
    categoryIds: string[]
  ) {
    // Verify listing belongs to business
    const listing = await prisma.foodListing.findFirst({
      where: {
        id: listingId,
        business_id: businessId,
      },
    });

    if (!listing) {
      throw new AppError("Food listing not found or unauthorized", 404);
    }

    // Verify all categories exist
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new AppError("One or more categories not found", 404);
    }

    // Add categories in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Remove existing categories
      await prisma.listingCategory.deleteMany({
        where: {
          listing_id: listingId,
        },
      });

      // Add new categories
      const listingCategories = await prisma.listingCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          listing_id: listingId,
          category_id: categoryId,
        })),
      });

      // Get updated listing with categories
      const updatedListing = await prisma.foodListing.findUnique({
        where: { id: listingId },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return updatedListing;
    });

    return result;
  }

  async removeCategoriesFromListing(
    businessId: string,
    listingId: string,
    categoryIds: string[]
  ) {
    // Verify listing belongs to business
    const listing = await prisma.foodListing.findFirst({
      where: {
        id: listingId,
        business_id: businessId,
      },
    });

    if (!listing) {
      throw new AppError("Food listing not found or unauthorized", 404);
    }

    // Remove specified categories
    await prisma.listingCategory.deleteMany({
      where: {
        listing_id: listingId,
        category_id: {
          in: categoryIds,
        },
      },
    });

    // Get updated listing with remaining categories
    const updatedListing = await prisma.foodListing.findUnique({
      where: { id: listingId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return updatedListing;
  }

  async getListingCategories(listingId: string) {
    const listing = await prisma.foodListing.findUnique({
      where: { id: listingId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!listing) {
      throw new AppError("Food listing not found", 404);
    }

    return listing.categories;
  }
}
