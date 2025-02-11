// src/routes/review.routes.ts
import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get("/:reviewId", reviewController.getReview);
router.get(
  "/business/:businessId",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minRating").optional().isInt({ min: 1, max: 5 }),
    query("maxRating").optional().isInt({ min: 1, max: 5 }),
  ],
  validate,
  reviewController.getBusinessReviews
);

router.get(
  "/listing/:listingId",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minRating").optional().isInt({ min: 1, max: 5 }),
    query("maxRating").optional().isInt({ min: 1, max: 5 }),
  ],
  validate,
  reviewController.getListingReviews
);

// Protected routes
router.use(protect);

// Customer only routes
router.post(
  "/",
  authorize("CUSTOMER"),
  [
    body("reservation_id").isString().notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").isString().notEmpty(),
    body("images").optional().isArray(),
    body("images.*").optional().isString(),
  ],
  validate,
  reviewController.createReview
);

router.patch(
  "/:reviewId",
  authorize("CUSTOMER"),
  [
    body("rating").optional().isInt({ min: 1, max: 5 }),
    body("comment").optional().isString(),
    body("images").optional().isArray(),
    body("images.*").optional().isString(),
  ],
  validate,
  reviewController.updateReview
);

router.delete(
  "/:reviewId",
  authorize("CUSTOMER"),
  reviewController.deleteReview
);

export default router;
