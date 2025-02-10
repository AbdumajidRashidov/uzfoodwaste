// src/routes/customer.routes.ts
import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const customerController = new CustomerController();

// Get customer profile
router.get(
  "/profile",
  protect,
  authorize("CUSTOMER"),
  customerController.getProfile
);

// Update customer profile
router.patch(
  "/profile",
  protect,
  authorize("CUSTOMER"),
  [
    body("first_name").optional().isString(),
    body("last_name").optional().isString(),
    body("address").optional().isString(),
    body("birth_date").optional().isISO8601(),
    body("profile_picture").optional().isString(),
    body("phone").optional().isString(),
    body("language_preference").optional().isString(),
  ],
  validate,
  customerController.updateProfile
);

// Get saved listings
router.get(
  "/saved-listings",
  protect,
  authorize("CUSTOMER"),
  customerController.getSavedListings
);

// Save a listing
router.post(
  "/saved-listings/:listingId",
  protect,
  authorize("CUSTOMER"),
  customerController.saveListing
);

// Remove a saved listing
router.delete(
  "/saved-listings/:listingId",
  protect,
  authorize("CUSTOMER"),
  customerController.unsaveListing
);

// Get customer reservations
router.get(
  "/reservations",
  protect,
  authorize("CUSTOMER"),
  customerController.getReservations
);

// Get customer reviews
router.get(
  "/reviews",
  protect,
  authorize("CUSTOMER"),
  customerController.getReviews
);

export default router;
