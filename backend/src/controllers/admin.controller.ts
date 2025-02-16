// src/controller/admin.controller.ts;
import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const adminService = new AdminService();

export class AdminController {
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await adminService.createAdmin(req.body);
      res.status(201).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        role: req.query.role as string,
        searchTerm: req.query.search as string,
        isVerified: req.query.isVerified
          ? req.query.isVerified === "true"
          : undefined,
      };

      const result = await adminService.getAllUsers(query);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId } = req.params;
      const business = await adminService.verifyBusiness(businessId);
      res.status(200).json({
        status: "success",
        data: business,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSystemStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getSystemStats();
      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
