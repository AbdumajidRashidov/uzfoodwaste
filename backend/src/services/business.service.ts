// src/services/business.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class BusinessService {
  async getBusinessProfile(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            is_verified: true,
            created_at: true,
          },
        },
        locations: true,
      },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    return business;
  }

  async updateBusinessProfile(
    businessId: string,
    data: {
      company_name?: string;
      legal_name?: string;
      tax_number?: string;
      business_license?: string;
      business_type?: string;
      registration_number?: string;
      verification_documents?: string;
      logo?: string;
      website?: string;
      working_hours?: string;
    }
  ) {
    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Check if company name is unique if being updated
    if (data.company_name) {
      const existingBusiness = await prisma.business.findUnique({
        where: { company_name: data.company_name },
      });

      if (existingBusiness && existingBusiness.id !== businessId) {
        throw new AppError("Company name already exists", 400);
      }
    }

    // Check if tax number is unique if being updated
    if (data.tax_number) {
      const existingBusiness = await prisma.business.findUnique({
        where: { tax_number: data.tax_number },
      });

      if (existingBusiness && existingBusiness.id !== businessId) {
        throw new AppError("Tax number already exists", 400);
      }
    }

    // Update business profile
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            is_verified: true,
          },
        },
      },
    });

    return updatedBusiness;
  }

  async addBusinessLocation(
    businessId: string,
    data: {
      address: string;
      latitude: number;
      longitude: number;
      city: string;
      district: string;
      postal_code: string;
      is_main_location: boolean;
      phone: string;
      working_hours: string;
    }
  ) {
    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // If this is the first location or is_main_location is true,
    // update other locations to not be main
    if (data.is_main_location) {
      await prisma.businessLocation.updateMany({
        where: { business_id: businessId },
        data: { is_main_location: false },
      });
    }

    // Create new location
    const location = await prisma.businessLocation.create({
      data: {
        ...data,
        business_id: businessId,
      },
    });

    return location;
  }

  async updateBusinessLocation(
    businessId: string,
    locationId: string,
    data: {
      address?: string;
      latitude?: number;
      longitude?: number;
      city?: string;
      district?: string;
      postal_code?: string;
      is_main_location?: boolean;
      phone?: string;
      working_hours?: string;
    }
  ) {
    // Check if location exists and belongs to business
    const location = await prisma.businessLocation.findFirst({
      where: {
        id: locationId,
        business_id: businessId,
      },
    });

    if (!location) {
      throw new AppError("Location not found", 404);
    }

    // If updating to main location, update other locations
    if (data.is_main_location) {
      await prisma.businessLocation.updateMany({
        where: {
          business_id: businessId,
          id: { not: locationId },
        },
        data: { is_main_location: false },
      });
    }

    // Update location
    const updatedLocation = await prisma.businessLocation.update({
      where: { id: locationId },
      data,
    });

    return updatedLocation;
  }

  async deleteBusinessLocation(businessId: string, locationId: string) {
    // Check if location exists and belongs to business
    const location = await prisma.businessLocation.findFirst({
      where: {
        id: locationId,
        business_id: businessId,
      },
    });

    if (!location) {
      throw new AppError("Location not found", 404);
    }

    // Check if this is the only location
    const locationCount = await prisma.businessLocation.count({
      where: { business_id: businessId },
    });

    if (locationCount === 1) {
      throw new AppError("Cannot delete the only business location", 400);
    }

    // Delete location
    await prisma.businessLocation.delete({
      where: { id: locationId },
    });

    return { message: "Location deleted successfully" };
  }

  async getBusinessLocations(businessId: string) {
    const locations = await prisma.businessLocation.findMany({
      where: { business_id: businessId },
    });

    return locations;
  }

  async getBusinessStats(businessId: string) {
    const [totalListings, activeListings, totalReservations, avgRating] =
      await Promise.all([
        // Total listings count
        prisma.foodListing.count({
          where: { business_id: businessId },
        }),
        // Active listings count
        prisma.foodListing.count({
          where: {
            business_id: businessId,
            status: "AVAILABLE",
          },
        }),
        // Total reservations count
        prisma.reservation.count({
          where: {
            listing: {
              business_id: businessId,
            },
          },
        }),
        // Average rating
        prisma.review.aggregate({
          where: { business_id: businessId },
          _avg: {
            rating: true,
          },
        }),
      ]);

    return {
      total_listings: totalListings,
      active_listings: activeListings,
      total_reservations: totalReservations,
      average_rating: avgRating._avg.rating || 0,
    };
  }
}
