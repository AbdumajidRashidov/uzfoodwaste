// src/routes/food-listing.routes.ts
import { Router } from "express";
import { FoodListingController } from "../controllers/food-listing.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const foodListingController = new FoodListingController();

// Public routes
router.get("/", foodListingController.getAllListings);
router.get("/:listingId", foodListingController.getListing);

// Protected routes
router.use(protect);

// Business routes
router.post(
  "/",
  authorize("BUSINESS"),
  [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("description")
      .isString()
      .notEmpty()
      .withMessage("Description is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("original_price")
      .isFloat({ min: 0 })
      .withMessage("Original price must be a positive number"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("unit").isString().notEmpty().withMessage("Unit is required"),
    body("expiry_date")
      .isISO8601()
      .withMessage("Valid expiry date is required"),
    body("pickup_start")
      .isISO8601()
      .withMessage("Valid pickup start time is required"),
    body("pickup_end")
      .isISO8601()
      .withMessage("Valid pickup end time is required"),
    body("images").isArray().withMessage("Images must be an array"),
    body("images.*").isString().withMessage("Each image must be a string URL"),
    body("is_halal").isBoolean().withMessage("Is halal must be a boolean"),
    body("preparation_time").optional().isString(),
    body("storage_instructions").optional().isString(),
    body("location_id")
      .isString()
      .notEmpty()
      .withMessage("Location ID is required"),
    body("category_ids").isArray().withMessage("Category IDs must be an array"),
    body("category_ids.*")
      .isString()
      .withMessage("Each category ID must be a string"),
  ],
  validate,
  foodListingController.createListing
);

router.patch(
  "/:listingId",
  authorize("BUSINESS"),
  [
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("original_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Original price must be a positive number"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("unit").optional().isString().withMessage("Unit must be a string"),
    body("expiry_date")
      .optional()
      .isISO8601()
      .withMessage("Expiry date must be a valid date"),
    body("pickup_start")
      .optional()
      .isISO8601()
      .withMessage("Pickup start time must be a valid date"),
    body("pickup_end")
      .optional()
      .isISO8601()
      .withMessage("Pickup end time must be a valid date"),
    body("images").optional().isArray().withMessage("Images must be an array"),
    body("images.*")
      .optional()
      .isString()
      .withMessage("Each image must be a string URL"),
    body("status")
      .optional()
      .isIn(["AVAILABLE", "UNAVAILABLE", "SOLD"])
      .withMessage("Invalid status"),
    body("is_halal")
      .optional()
      .isBoolean()
      .withMessage("Is halal must be a boolean"),
    body("preparation_time").optional().isString(),
    body("storage_instructions").optional().isString(),
    body("location_id")
      .optional()
      .isString()
      .withMessage("Location ID must be a string"),
    body("category_ids")
      .optional()
      .isArray()
      .withMessage("Category IDs must be an array"),
    body("category_ids.*")
      .optional()
      .isString()
      .withMessage("Each category ID must be a string"),
  ],
  validate,
  foodListingController.updateListing
);

router.delete(
  "/:listingId",
  authorize("BUSINESS"),
  foodListingController.deleteListing
);

// Get business's own listings
router.get(
  "/business/listings",
  authorize("BUSINESS"),
  [...FoodListingController.queryValidation],
  foodListingController.getBusinessListings
);

export default router;
