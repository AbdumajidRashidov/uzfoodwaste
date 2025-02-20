// src/controllers/branch.controller.ts
import { Request, Response, NextFunction } from "express";
import { BranchService } from "../services/branch.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const branchService = new BranchService();

export class BranchController {
  async createBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const branch = await branchService.createBranch(businessId, req.body);

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
      const branch = await branchService.updateBranch(
        branchId,
        businessId,
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

  async getBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { branchId } = req.params;
      const branch = await branchService.getBranch(branchId);

      res.status(200).json({
        status: "success",
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBusinessBranches(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
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
        status: req.query.status as string,
        search: req.query.search as string,
      };

      const branches = await branchService.getBusinessBranches(
        businessId,
        query
      );

      res.status(200).json({
        status: "success",
        data: branches,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBranchReview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const { branchId } = req.params;
      const review = await branchService.createBranchReview(
        branchId,
        customerId,
        req.body
      );

      res.status(201).json({
        status: "success",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBranchReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { branchId } = req.params;
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        rating: req.query.rating
          ? parseInt(req.query.rating as string)
          : undefined,
      };

      const reviews = await branchService.getBranchReviews(branchId, query);

      res.status(200).json({
        status: "success",
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBranchAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business ID not found", 400);
      }

      const { branchId } = req.params;
      const { period } = req.query;

      const analytics = await branchService.getBranchAnalytics(
        branchId,
        period as string
      );

      res.status(200).json({
        status: "success",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
