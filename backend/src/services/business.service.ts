// src/services/business.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class BusinessService {
  async getAllBusinesses(query: {
    page?: number;
    limit?: number;
    isVerified?: boolean;
    searchTerm?: string;
    hasBranches?: boolean; // New query parameter
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.isVerified !== undefined) {
      where.is_verified = query.isVerified;
    }

    if (query.searchTerm) {
      where.OR = [
        { company_name: { contains: query.searchTerm, mode: "insensitive" } },
        { legal_name: { contains: query.searchTerm, mode: "insensitive" } },
        { business_type: { contains: query.searchTerm, mode: "insensitive" } },
        // Search in branches as well
        {
          branches: {
            some: {
              name: { contains: query.searchTerm, mode: "insensitive" },
            },
          },
        },
      ];
    }

    // Filter businesses with/without branches
    if (query.hasBranches !== undefined) {
      where.branches = query.hasBranches
        ? { some: {} } // Has at least one branch
        : { none: {} }; // Has no branches
    }

    const [total, businesses] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              phone: true,
              is_verified: true,
              created_at: true,
            },
          },
          locations: {
            where: {
              is_main_location: true,
            },
            take: 1,
          },
          branches: {
            where: {
              status: "ACTIVE",
            },
            select: {
              id: true,
              name: true,
              branch_code: true,
              status: true,
            },
          },
          _count: {
            select: {
              branches: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          company_name: "desc",
        },
      }),
    ]);

    return {
      businesses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
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
        branches: {
          include: {
            location: true,
            food_listings: {
              where: {
                status: "AVAILABLE",
              },
            },
            branch_reviews: true,
          },
        },
      },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Calculate branch statistics
    const branchStats = business.branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      branch_code: branch.branch_code,
      status: branch.status,
      active_listings: branch.food_listings.length,
      average_rating:
        branch.branch_reviews.length > 0
          ? branch.branch_reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / branch.branch_reviews.length
          : 0,
      total_reviews: branch.branch_reviews.length,
      location: branch.location,
    }));

    return {
      ...business,
      branch_stats: branchStats,
      total_active_branches: business.branches.filter(
        (b) => b.status === "ACTIVE"
      ).length,
      total_branches: business.branches.length,
    };
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
    // Existing validation logic...
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    if (data.company_name) {
      const existingBusiness = await prisma.business.findUnique({
        where: { company_name: data.company_name },
      });

      if (existingBusiness && existingBusiness.id !== businessId) {
        throw new AppError("Company name already exists", 400);
      }
    }

    if (data.tax_number) {
      const existingBusiness = await prisma.business.findUnique({
        where: { tax_number: data.tax_number },
      });

      if (existingBusiness && existingBusiness.id !== businessId) {
        throw new AppError("Tax number already exists", 400);
      }
    }

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
        branches: {
          where: {
            status: "ACTIVE",
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
      // New optional fields for branch creation
      create_branch?: boolean;
      branch_data?: {
        name: string;
        branch_code: string;
        description?: string;
        manager_name: string;
        manager_email: string;
        manager_phone: string;
        operating_hours: any;
        services: string[];
        policies?: any;
      };
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

    // Create location and optionally a branch in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create new location
      const location = await prisma.businessLocation.create({
        data: {
          business_id: businessId,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          district: data.district,
          postal_code: data.postal_code,
          is_main_location: data.is_main_location,
          phone: data.phone,
          working_hours: data.working_hours,
        },
      });

      // If branch creation is requested
      if (data.create_branch && data.branch_data) {
        // Verify branch code uniqueness
        const existingBranch = await prisma.branch.findFirst({
          where: { branch_code: data.branch_data.branch_code },
        });

        if (existingBranch) {
          throw new AppError("Branch code already exists", 400);
        }

        // Create branch
        const branch = await prisma.branch.create({
          data: {
            ...data.branch_data,
            business_id: businessId,
            location_id: location.id,
            opening_date: new Date(),
            status: "ACTIVE",
          },
        });

        return { location, branch };
      }

      return { location };
    });

    return result;
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
      include: {
        branch: true,
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
      include: {
        branch: true,
      },
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
      include: {
        branch: true,
        food_listings: true,
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

    // Check if location has an active branch
    if (location.branch && location.branch.status === "ACTIVE") {
      throw new AppError("Cannot delete location with active branch", 400);
    }

    // Check for active listings
    const activeListings = location.food_listings.some(
      (listing) => listing.status === "AVAILABLE"
    );

    if (activeListings) {
      throw new AppError("Cannot delete location with active listings", 400);
    }

    // Delete in transaction
    await prisma.$transaction(async (prisma) => {
      // If location has a branch, deactivate it first
      if (location.branch) {
        await prisma.branch.update({
          where: { id: location.branch.id },
          data: { status: "INACTIVE" },
        });
      }

      // Delete location
      await prisma.businessLocation.delete({
        where: { id: locationId },
      });
    });

    return { message: "Location deleted successfully" };
  }
  async getBusinessLocations(businessId: string) {
    const locations = await prisma.businessLocation.findMany({
      where: { business_id: businessId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            branch_code: true,
            status: true,
            food_listings: {
              where: {
                status: "AVAILABLE",
              },
            },
            branch_reviews: true,
          },
        },
        food_listings: {
          where: {
            status: "AVAILABLE",
          },
        },
      },
    });

    // Add statistics for each location
    const locationsWithStats = locations.map((location) => {
      const stats = {
        active_listings: location.food_listings.length,
        has_active_branch: location.branch?.status === "ACTIVE",
        branch_details: location.branch
          ? {
              name: location.branch.name,
              code: location.branch.branch_code,
              active_listings: location.branch.food_listings.length,
              average_rating:
                location.branch.branch_reviews.length > 0
                  ? location.branch.branch_reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / location.branch.branch_reviews.length
                  : 0,
            }
          : null,
      };

      return {
        ...location,
        stats,
      };
    });

    return locationsWithStats;
  }
  async getBusinessStats(businessId: string) {
    const [
      businessData,
      totalListings,
      activeListings,
      totalReservations,
      avgRating,
      branchStats,
    ] = await Promise.all([
      // Get business data
      prisma.business.findUnique({
        where: { id: businessId },
        include: {
          branches: {
            where: { status: "ACTIVE" },
            include: {
              food_listings: true,
              branch_reviews: true,
            },
          },
        },
      }),
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
      // Branch-specific stats
      prisma.branch.findMany({
        where: {
          business_id: businessId,
          status: "ACTIVE",
        },
        include: {
          food_listings: {
            where: {
              status: "AVAILABLE",
            },
          },
          branch_reviews: true,
          _count: {
            select: {
              food_listings: true,
            },
          },
        },
      }),
    ]);

    if (!businessData) {
      throw new AppError("Business not found", 404);
    }

    // Calculate branch-specific metrics
    const branchMetrics = branchStats.map((branch) => ({
      branch_id: branch.id,
      branch_name: branch.name,
      active_listings: branch.food_listings.length,
      total_listings: branch._count.food_listings,
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
      overall_stats: {
        total_listings: totalListings,
        active_listings: activeListings,
        total_reservations: totalReservations,
        average_rating: avgRating._avg.rating || 0,
        total_active_branches: businessData.branches.length,
      },
      branch_stats: branchMetrics,
    };
  }
  // Branch CRUD methods for business.service.ts

  async addBranch(
    businessId: string,
    data: {
      location_id: string;
      name: string;
      branch_code: string;
      description?: string;
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
      include: {
        branch: true,
      },
    });

    if (!location) {
      throw new AppError(
        "Location not found or doesn't belong to business",
        404
      );
    }

    // Check if location already has a branch
    if (location.branch) {
      throw new AppError("Location already has an associated branch", 400);
    }

    // Verify branch code uniqueness
    const existingBranch = await prisma.branch.findFirst({
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
        opening_date: new Date(),
        status: "ACTIVE",
      },
      include: {
        location: true,
        food_listings: {
          where: {
            status: "AVAILABLE",
          },
        },
      },
    });

    return branch;
  }

  async updateBranch(
    businessId: string,
    branchId: string,
    data: {
      name?: string;
      description?: string;
      status?: "ACTIVE" | "INACTIVE";
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
      include: {
        food_listings: {
          where: {
            status: "AVAILABLE",
          },
        },
      },
    });

    if (!branch) {
      throw new AppError("Branch not found or doesn't belong to business", 404);
    }

    // If status is being updated to INACTIVE, check for active listings
    if (data.status === "INACTIVE" && branch.food_listings.length > 0) {
      throw new AppError("Cannot deactivate branch with active listings", 400);
    }

    // Update branch
    const updatedBranch = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.branch.update({
        where: { id: branchId },
        data,
        include: {
          location: true,
          food_listings: true,
          branch_reviews: {
            take: 5,
            orderBy: {
              created_at: "desc",
            },
          },
        },
      });

      // If branch is being deactivated, update all listings
      if (data.status === "INACTIVE") {
        await prisma.foodListing.updateMany({
          where: {
            branch_id: branchId,
            status: "AVAILABLE",
          },
          data: {
            status: "UNAVAILABLE",
          },
        });
      }

      return updated;
    });

    return updatedBranch;
  }

  async deleteBranch(businessId: string, branchId: string) {
    // Verify branch exists and belongs to business
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        business_id: businessId,
      },
      include: {
        food_listings: {
          where: {
            status: "AVAILABLE",
          },
        },
      },
    });

    if (!branch) {
      throw new AppError("Branch not found or doesn't belong to business", 404);
    }

    // Check for active listings
    if (branch.food_listings.length > 0) {
      throw new AppError("Cannot delete branch with active listings", 400);
    }

    // Delete branch
    await prisma.$transaction(async (prisma) => {
      // First, update all listings to remove branch association
      await prisma.foodListing.updateMany({
        where: { branch_id: branchId },
        data: {
          branch_id: null,
          status: "UNAVAILABLE",
        },
      });

      // Delete branch reviews
      await prisma.branchReview.deleteMany({
        where: { branch_id: branchId },
      });

      // Delete branch
      await prisma.branch.delete({
        where: { id: branchId },
      });
    });

    return { message: "Branch deleted successfully" };
  }

  async getBranch(businessId: string, branchId: string) {
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        business_id: businessId,
      },
      include: {
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
            customer: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
          take: 5,
        },
      },
    });

    if (!branch) {
      throw new AppError("Branch not found or doesn't belong to business", 404);
    }

    // Calculate branch statistics
    const stats = {
      active_listings: branch.food_listings.length,
      average_rating:
        branch.branch_reviews.length > 0
          ? branch.branch_reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / branch.branch_reviews.length
          : 0,
      total_reviews: branch.branch_reviews.length,
      categories: branch.food_listings.reduce((acc, listing) => {
        listing.categories.forEach((cat) => {
          const category = cat.category;
          acc[category.name] = (acc[category.name] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
    };

    return {
      ...branch,
      stats,
    };
  }

  async getBranches(
    businessId: string,
    query: {
      page?: number;
      limit?: number;
      status?: "ACTIVE" | "INACTIVE";
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

    // Add statistics for each branch
    const branchesWithStats = branches.map((branch) => {
      const stats = {
        active_listings: branch.food_listings.length,
        average_rating:
          branch.branch_reviews.length > 0
            ? branch.branch_reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / branch.branch_reviews.length
            : 0,
        total_reviews: branch.branch_reviews.length,
      };

      return {
        ...branch,
        stats,
      };
    });

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
}
