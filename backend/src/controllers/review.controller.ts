// src/controllers/review.controller.ts
import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const reviewService = new ReviewService();

export class ReviewController {
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const review = await reviewService.createReview(customerId, req.body);
      res.status(201).json({
        status: "success",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const { reviewId } = req.params;
      const review = await reviewService.updateReview(
        reviewId,
        customerId,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const { reviewId } = req.params;
      await reviewService.deleteReview(reviewId, customerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const review = await reviewService.getReview(reviewId);
      res.status(200).json({
        status: "success",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBusinessReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId } = req.params;
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        minRating: req.query.minRating
          ? parseInt(req.query.minRating as string)
          : undefined,
        maxRating: req.query.maxRating
          ? parseInt(req.query.maxRating as string)
          : undefined,
      };

      const result = await reviewService.getBusinessReviews(businessId, query);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getListingReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.params;
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        minRating: req.query.minRating
          ? parseInt(req.query.minRating as string)
          : undefined,
        maxRating: req.query.maxRating
          ? parseInt(req.query.maxRating as string)
          : undefined,
      };

      const result = await reviewService.getListingReviews(listingId, query);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
