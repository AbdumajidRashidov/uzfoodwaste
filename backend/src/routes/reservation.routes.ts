// src/routes/reservation.routes.ts
import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query, param } from "express-validator";

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
    body("allow_multiple_businesses")
      .optional()
      .isBoolean()
      .withMessage("allow_multiple_businesses must be a boolean"),
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

// Verify pickup by ID
router.post(
  "/:reservationId/verify",
  authorize("BUSINESS", "BRANCH_MANAGER"),
  [body("confirmation_code").isString().notEmpty()],
  validate,
  reservationController.verifyPickup
);

// Verify pickup by reservation number
router.post(
  "/verify-by-number",
  authorize("BUSINESS", "BRANCH_MANAGER"),
  [
    body("reservation_number").isString().notEmpty(),
    body("confirmation_code").isString().notEmpty(),
  ],
  validate,
  reservationController.verifyPickupByNumber
);

// Get reservation QR code
router.get("/:reservationId/qr", reservationController.getReservationQR);

// Get reservation status
router.get(
  "/:reservationId/status",
  reservationController.getReservationStatus
);

// Get single reservation by ID
router.get("/:reservationId", reservationController.getReservation);

// Get single reservation by number
router.get(
  "/number/:reservationNumber",
  [
    param("reservationNumber")
      .isString()
      .notEmpty()
      .withMessage("Reservation number is required"),
  ],
  validate,
  reservationController.getReservationByNumber
);

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
  authorize("BUSINESS", "BRANCH_MANAGER"),
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

// Cancel reservation
router.post(
  "/:reservationId/cancel",
  [
    body("cancellation_reason")
      .isString()
      .notEmpty()
      .withMessage("Cancellation reason is required")
      .isLength({ max: 500 })
      .withMessage("Cancellation reason must be less than 500 characters"),
  ],
  validate,
  reservationController.cancelReservation
);

export default router;
