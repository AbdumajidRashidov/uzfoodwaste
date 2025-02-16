// src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const adminService = new AdminService();

export class AdminController {
  /**
   * Create a new admin user
   */
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

  /**
   * Get all users with filtering and pagination
   */
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

  /**
   * Get detailed system statistics
   */
  async getDetailedSystemStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stats = await adminService.getDetailedSystemStats();
      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get business analytics
   */
  async getBusinessAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId } = req.params;
      const analytics = await adminService.getBusinessAnalytics(businessId);
      res.status(200).json({
        status: "success",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getUserAnalytics();
      res.status(200).json({
        status: "success",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify a business
   */
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

  /**
   * Bulk update business verification status
   */
  async bulkUpdateBusinessVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { business_ids, is_verified } = req.body;
      const result = await adminService.bulkUpdateBusinessVerification({
        business_ids,
        is_verified,
      });
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manage food listings (activate/deactivate/delete)
   */
  async manageFoodListings(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, listing_ids, business_id } = req.body;

      if (!["ACTIVATE", "DEACTIVATE", "DELETE"].includes(action)) {
        throw new AppError("Invalid action specified", 400);
      }

      const result = await adminService.manageFoodListings({
        action,
        listing_ids,
        business_id,
      });

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new category
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await adminService.createCategory(req.body);
      res.status(201).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a category
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const category = await adminService.updateCategory(categoryId, req.body);
      res.status(200).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      await adminService.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle analytics export request
   */
  async exportBusinessAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { businessId } = req.params;
      const { format = "JSON" } = req.query;

      const analytics = await adminService.getBusinessAnalytics(businessId);

      if (format === "CSV") {
        // Convert analytics to CSV format
        const csv = this.convertToCSV(analytics);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=business-analytics-${businessId}.csv`
        );
        res.status(200).send(csv);
      } else {
        res.status(200).json({
          status: "success",
          data: analytics,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  private convertToCSV(data: any): string {
    const headers = this.getCSVHeaders(data);
    const rows = this.getCSVRows(data, headers);
    return [headers.join(","), ...rows].join("\n");
  }

  private getCSVHeaders(obj: any, prefix: string = ""): string[] {
    let headers: string[] = [];
    for (const key in obj) {
      const fullPath = prefix ? `${prefix}_${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        headers = headers.concat(this.getCSVHeaders(obj[key], fullPath));
      } else {
        headers.push(fullPath);
      }
    }
    return headers;
  }

  private getCSVRows(data: any, headers: string[]): string[] {
    const rows: string[] = [];
    const row: string[] = [];

    headers.forEach((header) => {
      const parts = header.split("_");
      let value = data;
      for (const part of parts) {
        value = value?.[part];
      }
      row.push(this.formatCSVValue(value));
    });

    rows.push(row.join(","));
    return rows;
  }

  private formatCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "string") {
      return `"${value.replace(/"/g, '""')}"`;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return `"${JSON.stringify(value)}"`;
    }
    return `"${JSON.stringify(value)}"`;
  }
}
