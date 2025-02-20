// src/routes/admin.routes.ts
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(protect);
router.use(authorize("ADMIN"));

// User Management Routes
router.post(
  "/create",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
  ],
  validate,
  adminController.createAdmin
);

router.get(
  "/users",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("role").optional().isIn(["ADMIN", "CUSTOMER", "BUSINESS"]),
    query("isVerified").optional().isBoolean(),
  ],
  validate,
  adminController.getAllUsers
);

// Analytics Routes
router.get("/stats/detailed", adminController.getDetailedSystemStats);
router.get("/analytics/users", adminController.getUserAnalytics);
router.get(
  "/analytics/business/:businessId",
  adminController.getBusinessAnalytics
);
router.get(
  "/analytics/business/:businessId/export",
  [query("format").optional().isIn(["JSON", "CSV"])],
  validate,
  adminController.exportBusinessAnalytics
);

// Business Management Routes
router.patch("/businesses/:businessId/verify", adminController.verifyBusiness);

router.post(
  "/businesses/verify-bulk",
  [
    body("business_ids").isArray().notEmpty(),
    body("business_ids.*").isString(),
    body("is_verified").isBoolean(),
  ],
  validate,
  adminController.bulkUpdateBusinessVerification
);

// Listing Management Routes
router.post(
  "/listings/manage",
  [
    body("action").isIn(["ACTIVATE", "DEACTIVATE", "DELETE"]),
    body("listing_ids").isArray().notEmpty(),
    body("listing_ids.*").isString(),
    body("business_id").optional().isString(),
  ],
  validate,
  adminController.manageFoodListings
);

// Category Management Routes
router.post(
  "/categories",
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("description")
      .isString()
      .notEmpty()
      .withMessage("Description is required"),
    body("image").isString().notEmpty().withMessage("image is required"),
  ],
  validate,
  adminController.createCategory
);

router.patch(
  "/categories/:categoryId",
  [
    body("name").optional().isString(),
    body("description").optional().isString(),
    body("image").optional().isString(),
  ],
  validate,
  adminController.updateCategory
);

router.delete("/categories/:categoryId", adminController.deleteCategory);

export default router;
