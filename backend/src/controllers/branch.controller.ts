// src/controllers/branch.controller.ts
import { Request, Response, NextFunction } from "express";
import { BranchService } from "../services/branch.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const branchService = new BranchService();

export class BranchController {
  /**
   * Create a new branch
   */
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

  /**
   * Update an existing branch
   */
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

  /**
   * Get a single branch by ID
   */
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

  /**
   * Get all branches for a business with filtering and pagination
   */
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

  /**
   * Create a review for a branch
   */
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

  /**
   * Get reviews for a branch with filtering and pagination
   */
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

  /**
   * Get analytics for a branch with optional time period filtering
   */
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
