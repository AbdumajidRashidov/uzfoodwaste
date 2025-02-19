// src/controllers/banner.controller.ts
import { Request, Response, NextFunction } from "express";
import { BannerService } from "../services/banner.service";

const bannerService = new BannerService();

export class BannerController {
  async createBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.createBanner(req.body);
      res.status(201).json({
        status: "success",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { bannerId } = req.params;
      const banner = await bannerService.updateBanner(bannerId, req.body);
      res.status(200).json({
        status: "success",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { bannerId } = req.params;
      await bannerService.deleteBanner(bannerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { bannerId } = req.params;
      const banner = await bannerService.getBanner(bannerId);
      res.status(200).json({
        status: "success",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        isActive: req.query.isActive
          ? req.query.isActive === "true"
          : undefined,
      };

      const result = await bannerService.getAllBanners(query);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBannerOrder(req: Request, res: Response, next: NextFunction) {
    try {
      await bannerService.updateBannerOrder(req.body);
      res.status(200).json({
        status: "success",
        message: "Banner order updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
