// src/routes/branch-manager.routes.ts
import { Router } from "express";
import { BranchManagerController } from "../controllers/branch-manager.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const router = Router();
const branchManagerController = new BranchManagerController();

// Protected routes - only for branch managers
router.use(protect);

// Branch manager profile routes
router.get(
  "/profile",
  authorize("BRANCH_MANAGER"),
  branchManagerController.getProfile
);

router.patch(
  "/profile",
  authorize("BRANCH_MANAGER"),
  [
    body("phone").optional().isString(),
    body("first_name").optional().isString(),
    body("last_name").optional().isString(),
  ],
  validate,
  branchManagerController.updateProfile
);

// Branch statistics and settings
router.get(
  "/stats",
  authorize("BRANCH_MANAGER"),
  branchManagerController.getBranchStats
);

router.patch(
  "/settings",
  authorize("BRANCH_MANAGER"),
  [
    body("operating_hours").optional().isObject(),
    body("services").optional().isArray(),
    body("services.*").optional().isString(),
    body("policies").optional().isObject(),
  ],
  validate,
  branchManagerController.updateBranchSettings
);

// Admin/Business routes for managing branch managers
router.get(
  "/",
  authorize("ADMIN", "BUSINESS"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("businessId").optional().isString(),
    query("branchId").optional().isString(),
    query("search").optional().isString(),
  ],
  validate,
  branchManagerController.getBranchManagers
);

router.post(
  "/:managerId/reset-password",
  authorize("ADMIN", "BUSINESS"),
  branchManagerController.resetManagerPassword
);

router.patch(
  "/:managerId/status",
  authorize("ADMIN", "BUSINESS"),
  [
    body("status")
      .isIn(["ACTIVE", "INACTIVE"])
      .withMessage("Status must be either ACTIVE or INACTIVE"),
  ],
  validate,
  branchManagerController.updateManagerStatus
);

export default router;
