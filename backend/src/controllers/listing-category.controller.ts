// src/controllers/listing-category.controller.ts
import { Request, Response, NextFunction } from "express";
import { ListingCategoryService } from "../services/listing-category.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const listingCategoryService = new ListingCategoryService();

export class ListingCategoryController {
  async addCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { listingId } = req.params;
      const { category_ids } = req.body;

      const result = await listingCategoryService.addCategoriesToListing(
        businessId,
        listingId,
        category_ids
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { listingId } = req.params;
      const { category_ids } = req.body;

      const result = await listingCategoryService.removeCategoriesFromListing(
        businessId,
        listingId,
        category_ids
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.params;
      const categories = await listingCategoryService.getListingCategories(
        listingId
      );

      res.status(200).json({
        status: "success",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
