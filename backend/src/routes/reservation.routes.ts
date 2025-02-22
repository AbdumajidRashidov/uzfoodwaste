// src/routes/reservation.routes.ts
import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const router = Router();
const reservationController = new ReservationController();

// All routes require authentication
router.use(protect);

// Create reservation (Customer only)
router.post(
  "/",
  authorize("CUSTOMER"),
  [
    body("items").isArray().notEmpty().withMessage("Items array is required"),
    body("items.*.listing_id").isString().notEmpty(),
    body("items.*.quantity").isInt({ min: 1 }),
    body("pickup_time")
      .isISO8601()
      .withMessage("Valid pickup time is required"),
  ],
  validate,
  reservationController.createReservation
);

// Process payment
router.post(
  "/:reservationId/payment",
  authorize("CUSTOMER"),
  [
    body("amount").isFloat({ min: 0 }),
    body("currency").isString().notEmpty(),
    body("payment_method").isString().notEmpty(),
  ],
  validate,
  reservationController.processPayment
);

// Verify pickup
router.post(
  "/:reservationId/verify",
  authorize("BUSINESS"),
  [body("confirmation_code").isString().notEmpty()],
  validate,
  reservationController.verifyPickup
);

// Get reservation QR code
router.get("/:reservationId/qr", reservationController.getReservationQR);

// Get reservation status
router.get(
  "/:reservationId/status",
  reservationController.getReservationStatus
);

// Get single reservation
router.get("/:reservationId", reservationController.getReservation);

// Get customer reservations
router.get(
  "/customer/list",
  authorize("CUSTOMER"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
    query("from_date").optional().isISO8601(),
    query("to_date").optional().isISO8601(),
  ],
  validate,
  reservationController.getCustomerReservations
);

// Get business reservations
router.get(
  "/business/list",
  authorize("BUSINESS"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
    query("from_date").optional().isISO8601(),
    query("to_date").optional().isISO8601(),
    query("branch_id").optional().isString(),
  ],
  validate,
  reservationController.getBusinessReservations
);

export default router;
