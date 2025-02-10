// src/controllers/business.controller.ts
import { Request, Response, NextFunction } from "express";
import { BusinessService } from "../services/business.service";

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
  async updateBusinessProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.businessId;
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
  async addBusinessLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.businessId;
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
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { businessId, locationId } = req.params;
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
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { businessId, locationId } = req.params;
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
  async getBusinessLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.businessId;
      const locations = await businessService.getBusinessLocations(businessId);

      res.status(200).json({
        status: "success",
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }
  async getBusinessStats(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.businessId;
      const stats = await businessService.getBusinessStats(businessId);

      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
