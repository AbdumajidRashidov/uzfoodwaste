// src/controllers/saved-listing.controller.ts
import { Request, Response, NextFunction } from "express";
import { SavedListingService } from "../services/saved-listing.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const savedListingService = new SavedListingService();

export class SavedListingController {
  async saveListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const { listingId } = req.params;
      const notes = req.body.notes;
      const notification_enabled = req.body.notification_enabled;

      const savedListing = await savedListingService.saveListing(
        customerId,
        listingId,
        { notes, notification_enabled }
      );

      res.status(201).json({
        status: "success",
        data: savedListing,
      });
    } catch (error) {
      next(error);
    }
  }

  async unsaveListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const { listingId } = req.params;
      await savedListingService.unsaveListing(customerId, listingId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updateSavedListing(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const { listingId } = req.params;
      const updates = {
        notes: req.body.notes,
        notification_enabled: req.body.notification_enabled,
      };

      const updatedListing = await savedListingService.updateSavedListing(
        customerId,
        listingId,
        updates
      );

      res.status(200).json({
        status: "success",
        data: updatedListing,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSavedListings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
      };

      const savedListings = await savedListingService.getSavedListings(
        customerId,
        query
      );

      res.status(200).json({
        status: "success",
        data: savedListings,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkSavedStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const { listingId } = req.params;
      const isSaved = await savedListingService.checkSavedStatus(
        customerId,
        listingId
      );

      res.status(200).json({
        status: "success",
        data: { is_saved: isSaved },
      });
    } catch (error) {
      next(error);
    }
  }
}
