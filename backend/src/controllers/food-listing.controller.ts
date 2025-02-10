// src/controllers/food-listing.controller.ts
import { Request, Response, NextFunction } from "express";
import { FoodListingService } from "../services/food-listing.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const foodListingService = new FoodListingService();

export class FoodListingController {
  async createListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new Error("Business ID not found");
      }

      const listing = await foodListingService.createListing(
        businessId,
        req.body
      );
      res.status(201).json({
        status: "success",
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new Error("Business ID not found");
      }

      const { listingId } = req.params;
      const listing = await foodListingService.updateListing(
        businessId,
        listingId,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new Error("Business ID not found");
      }

      const { listingId } = req.params;
      await foodListingService.deleteListing(businessId, listingId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.params;
      const listing = await foodListingService.getListing(listingId);
      res.status(200).json({
        status: "success",
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllListings(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        isHalal: req.query.isHalal ? req.query.isHalal === "true" : undefined,
        status: req.query.status as string | undefined,
        businessId: req.query.businessId as string | undefined,
        locationId: req.query.locationId as string | undefined,
      };

      const listings = await foodListingService.getAllListings(query);
      res.status(200).json({
        status: "success",
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBusinessListings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new Error("Business ID not found");
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        status: req.query.status as string | undefined,
      };

      const listings = await foodListingService.getBusinessListings(
        businessId,
        query
      );
      res.status(200).json({
        status: "success",
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }
}
