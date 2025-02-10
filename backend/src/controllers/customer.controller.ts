// src/controllers/customer.controller.ts
import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const customerService = new CustomerService();

export class CustomerController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new Error("Customer ID not found");
      }

      const profile = await customerService.getProfile(customerId);
      res.status(200).json({
        status: "success",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new Error("Customer ID not found");
      }

      const updatedProfile = await customerService.updateProfile(
        customerId,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSavedListings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new Error("Customer ID not found");
      }

      const savedListings = await customerService.getSavedListings(customerId);
      res.status(200).json({
        status: "success",
        data: savedListings,
      });
    } catch (error) {
      next(error);
    }
  }

  async saveListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new Error("Customer ID not found");
      }

      const { listingId } = req.params;
      const savedListing = await customerService.saveUnsaveListing(
        customerId,
        listingId,
        "save"
      );
      res.status(200).json({
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
        throw new Error("Customer ID not found");
      }

      const { listingId } = req.params;
      await customerService.saveUnsaveListing(customerId, listingId, "unsave");
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new Error("Customer ID not found");
      }

      const { status } = req.query;
      const reservations = await customerService.getReservations(
        customerId,
        status as string | undefined
      );

      res.status(200).json({
        status: "success",
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new Error("Customer ID not found");
      }

      const reviews = await customerService.getReviews(customerId);
      res.status(200).json({
        status: "success",
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}
