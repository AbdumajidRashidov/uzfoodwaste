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

/**
 * Create a new reservation (Customer Only)
 */
router.post(
  "/",
  authorize("CUSTOMER"),
  [
    body("listing_id")
      .isString()
      .notEmpty()
      .withMessage("Listing ID is required"),
    body("pickup_time")
      .isISO8601()
      .withMessage("Valid pickup time is required"),
  ],
  validate,
  reservationController.createReservation
);

/**
 * Process payment and generate QR code (Customer Only)
 */
router.post(
  "/:reservationId/payment",
  authorize("CUSTOMER"),
  [
    body("amount").isFloat({ min: 0 }).withMessage("Valid amount is required"),
    body("currency").isString().notEmpty().withMessage("Currency is required"),
    body("payment_method")
      .isString()
      .notEmpty()
      .withMessage("Payment method is required"),
  ],
  validate,
  reservationController.processPayment
);

/**
 * Get QR code for a reservation (Both Customer and Business)
 */
router.get("/:reservationId/qr", reservationController.getQRCode);

/**
 * Verify pickup using QR code (Business Only)
 */
router.post(
  "/:reservationId/verify",
  authorize("BUSINESS"),
  [
    body("confirmation_code")
      .isString()
      .notEmpty()
      .withMessage("Confirmation code is required"),
  ],
  validate,
  reservationController.verifyPickup
);

/**
 * Get reservation status (Both Customer and Business)
 */
router.get(
  "/:reservationId/status",
  reservationController.getReservationStatus
);

/**
 * Update reservation status (Both Customer and Business)
 */
router.patch(
  "/:reservationId/status",
  [
    body("status")
      .isIn(["CONFIRMED", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid status"),
    body("cancellation_reason")
      .if(body("status").equals("CANCELLED"))
      .isString()
      .notEmpty()
      .withMessage("Cancellation reason is required when cancelling"),
  ],
  validate,
  reservationController.updateReservationStatus
);

/**
 * Get single reservation details (Both Customer and Business)
 */
router.get("/:reservationId", reservationController.getReservation);

/**
 * Get business reservations with filters (Business Only)
 */
router.get(
  "/business/reservations",
  authorize("BUSINESS"),
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid status"),
    query("from_date").optional().isISO8601().withMessage("Invalid from date"),
    query("to_date").optional().isISO8601().withMessage("Invalid to date"),
  ],
  validate,
  reservationController.getBusinessReservations
);

/**
 * Get customer's reservations with filters (Customer Only)
 */
router.get(
  "/customer/reservations",
  authorize("CUSTOMER"),
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid status"),
    query("from_date").optional().isISO8601().withMessage("Invalid from date"),
    query("to_date").optional().isISO8601().withMessage("Invalid to date"),
  ],
  validate,
  reservationController.getCustomerReservations
);

export default router;
