// src/routes/branch.routes.ts
import { Router } from "express";
import { BranchController } from "../controllers/branch.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const router = Router();
const branchController = new BranchController();

// Public routes
router.get("/:branchId", branchController.getBranch);
router.get("/:branchId/reviews", branchController.getBranchReviews);

// Protected routes
router.use(protect);

// Business routes
router.post(
  "/",
  authorize("BUSINESS"),
  [
    body("location_id")
      .isString()
      .notEmpty()
      .withMessage("Location ID is required"),
    body("name").isString().notEmpty().withMessage("Branch name is required"),
    body("branch_code")
      .isString()
      .notEmpty()
      .withMessage("Branch code is required"),
    body("description").optional().isString(),
    body("opening_date")
      .isISO8601()
      .withMessage("Valid opening date is required"),
    body("manager_name")
      .isString()
      .notEmpty()
      .withMessage("Manager name is required"),
    body("manager_email")
      .isEmail()
      .withMessage("Valid manager email is required"),
    body("manager_phone")
      .isString()
      .notEmpty()
      .withMessage("Manager phone is required"),
    body("operating_hours")
      .isObject()
      .notEmpty()
      .withMessage("Operating hours are required"),
    body("services").isArray().withMessage("Services must be an array"),
    body("services.*").isString().withMessage("Each service must be a string"),
    body("policies").optional().isObject(),
  ],
  validate,
  branchController.createBranch
);

router.patch(
  "/:branchId",
  authorize("BUSINESS"),
  [
    body("name").optional().isString(),
    body("description").optional().isString(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
    body("manager_name").optional().isString(),
    body("manager_email").optional().isEmail(),
    body("manager_phone").optional().isString(),
    body("operating_hours").optional().isObject(),
    body("services").optional().isArray(),
    body("services.*").optional().isString(),
    body("policies").optional().isObject(),
  ],
  validate,
  branchController.updateBranch
);

router.get(
  "/business/branches",
  authorize("BUSINESS"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["ACTIVE", "INACTIVE"]),
    query("search").optional().isString(),
  ],
  validate,
  branchController.getBusinessBranches
);

router.get(
  "/:branchId/analytics",
  authorize("BUSINESS", "BRANCH_MANAGER"),
  [query("period").optional().isIn(["week", "month", "year"])],
  validate,
  branchController.getBranchAnalytics
);

// Customer routes
router.post(
  "/:branchId/reviews",
  authorize("CUSTOMER"),
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").isString().notEmpty().withMessage("Comment is required"),
  ],
  validate,
  branchController.createBranchReview
);

export default router;
