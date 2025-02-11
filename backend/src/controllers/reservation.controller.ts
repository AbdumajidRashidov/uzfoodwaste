// src/controllers/reservation.controller.ts
import { Request, Response, NextFunction } from "express";
import { ReservationService } from "../services/reservation.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";

const reservationService = new ReservationService();

export class ReservationController {
  /**
   * Create a new reservation
   */
  async createReservation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const reservation = await reservationService.createReservation(
        customerId,
        req.body
      );
      res.status(201).json({
        status: "success",
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process payment for a reservation and generate QR code
   */
  async processPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer ID not found", 400);
      }

      const result = await reservationService.processPaymentAndGenerateQR(
        reservationId,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get QR code for a confirmed reservation
   */
  async getQRCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const userId = req.user?.customer?.id || req.user?.business?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        throw new AppError("User authentication required", 401);
      }

      const qrData = await reservationService.getReservationQR(
        reservationId,
        userId,
        userRole
      );

      res.status(200).json({
        status: "success",
        data: qrData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify pickup using confirmation code
   */
  async verifyPickup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const { confirmation_code } = req.body;
      const businessId = req.user?.business?.id;

      if (!businessId) {
        throw new AppError("Business authentication required", 401);
      }

      const result = await reservationService.verifyPickup(
        reservationId,
        confirmation_code,
        businessId
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reservation status including payment and pickup details
   */
  async getReservationStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { reservationId } = req.params;
      const userId = req.user?.customer?.id || req.user?.business?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        throw new AppError("User authentication required", 401);
      }

      const status = await reservationService.getReservationStatus(
        reservationId,
        userId,
        userRole
      );

      res.status(200).json({
        status: "success",
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update reservation status (cancel, confirm, complete)
   */
  async updateReservationStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { reservationId } = req.params;
      const actorId = req.user?.customer?.id || req.user?.business?.id;
      const actorRole = req.user?.role as "CUSTOMER" | "BUSINESS";

      if (!actorId) {
        throw new AppError("User authentication required", 401);
      }

      const reservation = await reservationService.updateReservationStatus(
        reservationId,
        req.body,
        actorId,
        actorRole
      );

      res.status(200).json({
        status: "success",
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed reservation information
   */
  async getReservation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const actorId = req.user?.customer?.id || req.user?.business?.id;
      const actorRole = req.user?.role as "CUSTOMER" | "BUSINESS";

      if (!actorId) {
        throw new AppError("User authentication required", 401);
      }

      const reservation = await reservationService.getReservation(
        reservationId,
        actorId,
        actorRole
      );

      res.status(200).json({
        status: "success",
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reservations for a business
   */
  async getBusinessReservations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const businessId = req.user?.business?.id;
      if (!businessId) {
        throw new AppError("Business authentication required", 401);
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        status: req.query.status as string | undefined,
        from_date: req.query.from_date
          ? new Date(req.query.from_date as string)
          : undefined,
        to_date: req.query.to_date
          ? new Date(req.query.to_date as string)
          : undefined,
      };

      const result = await reservationService.getBusinessReservations(
        businessId,
        query
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer's reservations
   */
  async getCustomerReservations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customerId = req.user?.customer?.id;
      if (!customerId) {
        throw new AppError("Customer authentication required", 401);
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        status: req.query.status as string | undefined,
        from_date: req.query.from_date
          ? new Date(req.query.from_date as string)
          : undefined,
        to_date: req.query.to_date
          ? new Date(req.query.to_date as string)
          : undefined,
      };

      const result = await reservationService.getCustomerReservations(
        customerId,
        query
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
