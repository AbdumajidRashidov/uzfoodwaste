// src/controllers/reservation.controller.ts
import { Request, Response, NextFunction } from "express";
import { ReservationService } from "../services/reservation.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/error.middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const reservationService = new ReservationService();

export class ReservationController {
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

  async processPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
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

  async verifyPickup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const { confirmation_code } = req.body;
      const user = req?.user;

      const branch = await prisma.branch.findFirst({
        where: {
          manager_email: user?.email,
        },
      });
      const businessId = branch?.business_id as string;

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

  async getReservationQR(req: AuthRequest, res: Response, next: NextFunction) {
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

      const queryOptions = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        from_date: req.query.from_date
          ? new Date(req.query.from_date as string)
          : undefined,
        to_date: req.query.to_date
          ? new Date(req.query.to_date as string)
          : undefined,
      };

      const result = await reservationService.getCustomerReservations(
        customerId,
        queryOptions
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBusinessReservations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req?.user;

      const branch = await prisma.branch.findFirst({
        where: {
          manager_email: user?.email,
        },
      });
      const businessId = branch?.business_id as string;

      if (!businessId) {
        throw new AppError("Business authentication required", 401);
      }

      const result = await reservationService.getBusinessReservations(
        businessId,
        req.query
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

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
}
