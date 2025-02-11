// src/routes/saved-listing.routes.ts
import { Router } from "express";
import { SavedListingController } from "../controllers/saved-listing.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const savedListingController = new SavedListingController();

// All routes require customer authentication
router.use(protect);
router.use(authorize("CUSTOMER"));

// Get all saved listings
router.get("/", savedListingController.getSavedListings);

// Save a listing
router.post(
  "/:listingId",
  [
    body("notes").optional().isString(),
    body("notification_enabled").optional().isBoolean(),
  ],
  validate,
  savedListingController.saveListing
);

// Update saved listing
router.patch(
  "/:listingId",
  [
    body("notes").optional().isString(),
    body("notification_enabled").optional().isBoolean(),
  ],
  validate,
  savedListingController.updateSavedListing
);

// Remove saved listing
router.delete("/:listingId", savedListingController.unsaveListing);

// Check if listing is saved
router.get("/:listingId/status", savedListingController.checkSavedStatus);

export default router;
