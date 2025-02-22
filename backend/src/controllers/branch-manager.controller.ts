// src/controllers/branch-manager.controller.ts
import { Request, Response, NextFunction } from "express";
import { BranchManagerService } from "../services/branch-manager.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const branchManagerService = new BranchManagerService();

export class BranchManagerController {
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const managerId = req.user?.id;
      if (!managerId) {
        throw new AppError("Manager ID not found", 400);
      }

      const profile = await branchManagerService.updateProfile(
        managerId,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const managerId = req.user?.id;
      if (!managerId) {
        throw new AppError("Manager ID not found", 400);
      }

      const profile = await branchManagerService.getProfile(managerId);
      res.status(200).json({
        status: "success",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBranchStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const managerId = req.user?.id;
      if (!managerId) {
        throw new AppError("Manager ID not found", 400);
      }

      const stats = await branchManagerService.getBranchStats(managerId);
      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBranchSettings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const managerId = req.user?.id;
      if (!managerId) {
        throw new AppError("Manager ID not found", 400);
      }

      const settings = await branchManagerService.updateBranchSettings(
        managerId,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBranchManagers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== "ADMIN" && req.user?.role !== "BUSINESS") {
        throw new AppError("Not authorized", 403);
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        businessId: req.query.businessId as string,
        branchId: req.query.branchId as string,
        search: req.query.search as string,
      };

      const managers = await branchManagerService.getBranchManagers(query);
      res.status(200).json({
        status: "success",
        data: managers,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetManagerPassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.user?.role !== "ADMIN" && req.user?.role !== "BUSINESS") {
        throw new AppError("Not authorized", 403);
      }

      const { managerId } = req.params;
      const result = await branchManagerService.resetManagerPassword(managerId);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateManagerStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.user?.role !== "ADMIN" && req.user?.role !== "BUSINESS") {
        throw new AppError("Not authorized", 403);
      }

      const { managerId } = req.params;
      const { status } = req.body;

      const result = await branchManagerService.updateManagerStatus(
        managerId,
        status
      );
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
