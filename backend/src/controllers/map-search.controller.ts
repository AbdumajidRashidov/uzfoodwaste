// src/controllers/map-search.controller.ts
import { Request, Response, NextFunction } from "express";
import { MapSearchService } from "../services/map-search.service";
import { validate } from "../middlewares/validation.middleware";
import { query } from "express-validator";

const mapSearchService = new MapSearchService();

export class MapSearchController {
  /**
   * Search for food listings within a specified area on the map
   */
  async searchListingsInArea(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = {
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
        radius: req.query.radius
          ? parseFloat(req.query.radius as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        categories: req.query.categories
          ? (req.query.categories as string).split(",")
          : undefined,
        isHalal: req.query.isHalal ? req.query.isHalal === "true" : undefined,
        searchTerm: req.query.search as string | undefined,
        prioritizeUrgent: req.query.prioritizeUrgent === "true",
      };

      const result = await mapSearchService.searchListingsInArea(queryParams);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get businesses within a specified area on the map
   */
  async getNearbyBusinesses(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = {
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
        radius: req.query.radius
          ? parseFloat(req.query.radius as string)
          : undefined,
        isVerified: req.query.isVerified
          ? req.query.isVerified === "true"
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
      };

      const result = await mapSearchService.getNearbyBusinesses(queryParams);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validation rules for map search
   */
  static mapSearchValidation = [
    query("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    query("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 50 })
      .withMessage("Radius must be between 0.1 and 50 kilometers"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("isHalal").optional().isBoolean(),
    query("prioritizeUrgent").optional().isBoolean(),
    validate,
  ];
}
