// src/services/customer.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class CustomerService {
  async getProfile(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            is_verified: true,
            language_preference: true,
          },
        },
      },
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    return customer;
  }

  async updateProfile(
    customerId: string,
    data: {
      first_name?: string;
      last_name?: string;
      address?: string;
      birth_date?: Date;
      profile_picture?: string;
      phone?: string;
      language_preference?: string;
    }
  ) {
    // Start a transaction to update both customer and user tables
    const updatedCustomer = await prisma.$transaction(async (prisma) => {
      // Update customer data
      const customerData: any = {};
      if (data.first_name) customerData.first_name = data.first_name;
      if (data.last_name) customerData.last_name = data.last_name;
      if (data.address) customerData.address = data.address;
      if (data.birth_date) customerData.birth_date = data.birth_date;
      if (data.profile_picture)
        customerData.profile_picture = data.profile_picture;

      const customer = await prisma.customer.update({
        where: { id: customerId },
        data: customerData,
      });

      // Update user data if phone or language preference is provided
      if (data.phone || data.language_preference) {
        const userData: any = {};
        if (data.phone) userData.phone = data.phone;
        if (data.language_preference)
          userData.language_preference = data.language_preference;

        await prisma.user.update({
          where: { id: customer.user_id },
          data: userData,
        });
      }

      return customer;
    });

    return this.getProfile(updatedCustomer.id);
  }

  async getSavedListings(customerId: string) {
    const savedListings = await prisma.savedListing.findMany({
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
    });

    return savedListings;
  }

  async saveUnsaveListing(
    customerId: string,
    listingId: string,
    action: "save" | "unsave"
  ) {
    // Check if listing exists
    const listing = await prisma.foodListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new AppError("Food listing not found", 404);
    }

    if (action === "save") {
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

      return await prisma.savedListing.create({
        data: {
          customer_id: customerId,
          listing_id: listingId,
        },
        include: {
          listing: true,
        },
      });
    } else {
      return await prisma.savedListing.delete({
        where: {
          customer_id_listing_id: {
            customer_id: customerId,
            listing_id: listingId,
          },
        },
      });
    }
  }

  async getReservations(customerId: string, status?: string) {
    const where: any = { customer_id: customerId };
    if (status) {
      where.status = status;
    }

    return await prisma.reservation.findMany({
      where,
      include: {
        FoodListing: {
          include: {
            business: true,
            branch: {
              include: {
                location: true,
              },
            },
          },
        },
        payment_transactions: true,
        reviews: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async getReviews(customerId: string) {
    return await prisma.review.findMany({
      where: { customer_id: customerId },
      include: {
        listing: true,
        business: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
}
