// src/routes/listing-category.routes.ts
import { Router } from "express";
import { ListingCategoryController } from "../controllers/listing-category.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const listingCategoryController = new ListingCategoryController();

// Public routes
router.get("/:listingId/categories", listingCategoryController.getCategories);

// Protected routes
router.use(protect);
router.use(authorize("BUSINESS"));

router.post(
  "/:listingId/categories",
  [
    body("category_ids")
      .isArray()
      .withMessage("category_ids must be an array")
      .notEmpty()
      .withMessage("category_ids cannot be empty"),
    body("category_ids.*")
      .isString()
      .withMessage("Each category ID must be a string"),
  ],
  validate,
  listingCategoryController.addCategories
);

router.delete(
  "/:listingId/categories",
  [
    body("category_ids")
      .isArray()
      .withMessage("category_ids must be an array")
      .notEmpty()
      .withMessage("category_ids cannot be empty"),
    body("category_ids.*")
      .isString()
      .withMessage("Each category ID must be a string"),
  ],
  validate,
  listingCategoryController.removeCategories
);

export default router;
