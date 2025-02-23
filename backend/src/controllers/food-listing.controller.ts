// src/controllers/food-listing.controller.ts
import { Request, Response, NextFunction } from "express";
import { FoodListingService } from "../services/food-listing.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const foodListingService = new FoodListingService();

export class FoodListingController {
  /**
   * Create a new food listing
   */
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

  /**
   * Update a food listing
   */
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

  /**
   * Delete a food listing
   */
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

  /**
   * Get a single food listing
   */
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

  /**
   * Get all food listings with filters
   */
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
        status: req.query.status as string | undefined,
        businessId: req.query.businessId as string | undefined,
        branchId: req.query.branchId as string | undefined,
        prioritizeUrgent: req.query.prioritizeUrgent === "true",
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

  /**
   * Get all listings for a business
   */
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
        branchId: req.query.branchId as string | undefined,
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

  /**
   * Validation rules for creating a food listing
   */
  static createListingValidation = [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("description")
      .isString()
      .notEmpty()
      .withMessage("Description is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("original_price")
      .isFloat({ min: 0 })
      .withMessage("Original price must be a positive number"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("unit").isString().notEmpty().withMessage("Unit is required"),
    body("expiry_date")
      .isISO8601()
      .withMessage("Valid expiry date is required"),
    body("pickup_start")
      .isISO8601()
      .withMessage("Valid pickup start time is required"),
    body("pickup_end")
      .isISO8601()
      .withMessage("Valid pickup end time is required"),
    body("images").isArray().withMessage("Images must be an array"),
    body("images.*").isString().withMessage("Each image must be a string URL"),
    body("storage_instructions").optional().isString(),
    body("categories").isArray().withMessage("Category IDs must be an array"),
    body("categories.*")
      .isString()
      .withMessage("Each category ID must be a string"),
    body("branch_id")
      .optional()
      .isString()
      .withMessage("Branch ID must be a string"),
    validate,
  ];

  /**
   * Validation rules for updating a food listing
   */
  static updateListingValidation = [
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("original_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Original price must be a positive number"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("unit").optional().isString().withMessage("Unit must be a string"),
    body("expiry_date")
      .optional()
      .isISO8601()
      .withMessage("Expiry date must be a valid date"),
    body("pickup_start")
      .optional()
      .isISO8601()
      .withMessage("Pickup start time must be a valid date"),
    body("pickup_end")
      .optional()
      .isISO8601()
      .withMessage("Pickup end time must be a valid date"),
    body("images").optional().isArray().withMessage("Images must be an array"),
    body("images.*")
      .optional()
      .isString()
      .withMessage("Each image must be a string URL"),
    body("status")
      .optional()
      .isIn(["AVAILABLE", "UNAVAILABLE", "SOLD"])
      .withMessage("Invalid status"),
    body("storage_instructions").optional().isString(),
    body("categories")
      .optional()
      .isArray()
      .withMessage("Category IDs must be an array"),
    body("categories.*")
      .optional()
      .isString()
      .withMessage("Each category ID must be a string"),
    body("branch_id")
      .optional()
      .isString()
      .withMessage("Branch ID must be a string"),
    validate,
  ];

  /**
   * Validation rules for listing queries
   */
  static queryValidation = [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid page number"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("minPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum price must be positive"),
    query("maxPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Maximum price must be positive"),
    query("isHalal").optional().isBoolean(),
    query("status")
      .optional()
      .isIn(["AVAILABLE", "UNAVAILABLE", "SOLD"])
      .withMessage("Invalid status"),
    query("branchId")
      .optional()
      .isUUID()
      .withMessage("Invalid branch ID format"),
    validate,
  ];
}
