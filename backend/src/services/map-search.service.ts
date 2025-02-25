// src/services/map-search.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { getPickupTimeStatus } from "../utils/time.util";

const prisma = new PrismaClient();

export class MapSearchService {
  /**
   * Search for food listings within a specified area on the map
   */
  async searchListingsInArea(query: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    isHalal?: boolean;
    searchTerm?: string;
    prioritizeUrgent?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      latitude,
      longitude,
      radius = 5, // Default radius of 5km
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      categories,
      isHalal,
      searchTerm,
      prioritizeUrgent = false,
    } = query;

    const skip = (page - 1) * limit;

    // Build the base where clause
    const where: any = {
      status: "AVAILABLE",
      quantity: { not: 0 },
      location: {
        // We'll replace this with an actual geographic query
        // but for now we'll fetch locations and filter in code
      },
    };

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Filter by category
    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          category_id: {
            in: categories,
          },
        },
      };
    }

    // Filter by halal status
    if (isHalal !== undefined) {
      where.is_halal = isHalal;
    }

    // Search term filter
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        {
          business: {
            company_name: { contains: searchTerm, mode: "insensitive" },
          },
        },
      ];
    }

    // Get all active listings with their locations
    const listings = await prisma.foodListing.findMany({
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
      orderBy: prioritizeUrgent
        ? [
            { pickup_status: "asc" },
            { pickup_end: "asc" },
            { created_at: "desc" },
          ]
        : { created_at: "desc" },
    });

    // Calculate distance for each listing and filter by radius
    const listingsWithDistance = listings
      .map((listing) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          parseFloat(listing.location.latitude.toString()),
          parseFloat(listing.location.longitude.toString())
        );

        return {
          ...listing,
          distance, // Distance in kilometers
          remaining_pickup_hours: this.calculateRemainingHours(
            listing.pickup_end
          ),
          pickup_status: getPickupTimeStatus(listing.pickup_end),
        };
      })
      .filter((listing) => listing.distance <= radius)
      .sort((a, b) => {
        // Sort by urgency first if requested
        if (prioritizeUrgent) {
          if (a.pickup_status === "urgent" && b.pickup_status !== "urgent")
            return -1;
          if (a.pickup_status !== "urgent" && b.pickup_status === "urgent")
            return 1;
        }

        // Then by distance
        return a.distance - b.distance;
      });

    // Paginate results
    const paginatedListings = listingsWithDistance.slice(skip, skip + limit);

    return {
      listings: paginatedListings,
      pagination: {
        total: listingsWithDistance.length,
        page,
        limit,
        totalPages: Math.ceil(listingsWithDistance.length / limit),
      },
    };
  }

  /**
   * Calculate the distance between two points using the Haversine formula
   * @param lat1 - Latitude of point 1
   * @param lon1 - Longitude of point 1
   * @param lat2 - Latitude of point 2
   * @param lon2 - Longitude of point 2
   * @returns Distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calculate remaining hours until a given end time
   * @param endTime - The pickup end time
   * @returns Number of hours remaining (rounded up)
   */
  private calculateRemainingHours(endTime: Date): number {
    const now = new Date();
    const timeDiff = endTime.getTime() - now.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60)));
  }

  /**
   * Get nearby businesses
   */
  async getNearbyBusinesses(query: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      latitude,
      longitude,
      radius = 5, // Default radius of 5km
      isVerified,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (isVerified !== undefined) {
      where.is_verified = isVerified;
    }

    // Fetch all businesses with their locations
    const businesses = await prisma.business.findMany({
      where,
      include: {
        locations: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    // Calculate distances and filter
    const businessesWithDistance = businesses
      .map((business) => {
        // Find the closest location for each business
        const closestLocation = business.locations.reduce(
          (closest, location) => {
            const distance = this.calculateDistance(
              latitude,
              longitude,
              parseFloat(location.latitude.toString()),
              parseFloat(location.longitude.toString())
            );

            if (!closest || distance < closest.distance) {
              return { ...location, distance };
            }
            return closest;
          },
          null as (any & { distance: number }) | null
        );

        if (!closestLocation) return null;

        return {
          ...business,
          distance: closestLocation.distance,
          closest_location: closestLocation,
        };
      })
      .filter((business) => business && business.distance <= radius)
      .sort((a, b) => a!.distance - b!.distance);

    // Paginate results
    const paginatedBusinesses = businessesWithDistance
      .filter(Boolean)
      .slice(skip, skip + limit);

    return {
      businesses: paginatedBusinesses,
      pagination: {
        total: businessesWithDistance.length,
        page,
        limit,
        totalPages: Math.ceil(businessesWithDistance.length / limit),
      },
    };
  }
}
