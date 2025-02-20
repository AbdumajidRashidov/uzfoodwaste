// src/controllers/business.controller.ts
import { Request, Response, NextFunction } from "express";
import { BusinessService } from "../services/business.service";
import { AppError } from "./../middlewares/error.middleware";
import { AuthRequest } from "./../types/user.types";

const businessService = new BusinessService();

export class BusinessController {
  async getAllBusinesses(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        isVerified: req.query.isVerified
          ? req.query.isVerified === "true"
          : undefined,
        searchTerm: req.query.search as string | undefined,
        hasBranches: req.query.hasBranches
          ? req.query.hasBranches === "true"
          : undefined, // New query parameter
      };

      const result = await businessService.getAllBusinesses(query);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async getBusinessProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.businessId;
      const business = await businessService.getBusinessProfile(businessId);

      res.status(200).json({
        status: "success",
        data: business,
      });
    } catch (error) {
      next(error);
    }
  }
  async updateBusinessProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.params.businessId;

      // Ensure the user owns this business
      if (req.user?.business?.id !== businessId) {
        throw new AppError(
          "Not authorized to update this business profile",
          403
        );
      }

      const updatedBusiness = await businessService.updateBusinessProfile(
        businessId,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: updatedBusiness,
      });
    } catch (error) {
      next(error);
    }
  }
  async addBusinessLocation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const location = await businessService.addBusinessLocation(
        businessId,
        req.body
      );

      res.status(201).json({
        status: "success",
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }
  async updateBusinessLocation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { locationId } = req.params;
      const location = await businessService.updateBusinessLocation(
        businessId,
        locationId,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteBusinessLocation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { locationId } = req.params;
      const result = await businessService.deleteBusinessLocation(
        businessId,
        locationId
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async getBusinessLocations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const locations = await businessService.getBusinessLocations(businessId);

      res.status(200).json({
        status: "success",
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }
  async getBusinessStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.businessId;

      // Optional period parameter for time-based stats
      const period = req.query.period as string | undefined;

      // Ensure the user owns this business
      if (req.user?.business?.id !== businessId) {
        throw new AppError("Not authorized to view these statistics", 403);
      }

      const stats = await businessService.getBusinessStats(businessId);

      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  async addBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const branch = await businessService.addBranch(businessId, req.body);

      res.status(201).json({
        status: "success",
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  }
  async updateBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { branchId } = req.params;
      const branch = await businessService.updateBranch(
        businessId,
        branchId,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { branchId } = req.params;
      await businessService.deleteBranch(businessId, branchId);

      res.status(200).json({
        status: "success",
        message: "Branch deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async getBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { branchId } = req.params;
      const branch = await businessService.getBranch(businessId, branchId);

      res.status(200).json({
        status: "success",
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  }
  async getBranches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        status: req.query.status as "ACTIVE" | "INACTIVE" | undefined,
        search: req.query.search as string | undefined,
      };

      const branches = await businessService.getBranches(businessId, query);

      res.status(200).json({
        status: "success",
        data: branches,
      });
    } catch (error) {
      next(error);
    }
  }
}
