// src/routes/business.routes.ts
import { Router } from "express";
import { BusinessController } from "../controllers/business.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query, param } from "express-validator";

const router = Router();
const businessController = new BusinessController();

// Public business listing routes
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("isVerified").optional().isBoolean(),
    query("search").optional().isString(),
    query("hasBranches").optional().isBoolean(),
  ],
  validate,
  businessController.getAllBusinesses
);

// Get business profile
router.get(
  "/:businessId",
  [param("businessId").isUUID().withMessage("Invalid business ID")],
  validate,
  businessController.getBusinessProfile
);

// Protected routes
router.use(protect);
router.use(authorize("BUSINESS"));

// Update business profile
router.patch(
  "/:businessId",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    body("company_name").optional().isString(),
    body("legal_name").optional().isString(),
    body("tax_number").optional().isString(),
    body("business_license").optional().isString(),
    body("business_type").optional().isString(),
    body("registration_number").optional().isString(),
    body("verification_documents").optional().isString(),
    body("logo").optional().isString(),
    body("website").optional().isURL().optional(),
    body("working_hours").optional().isString(),
  ],
  validate,
  businessController.updateBusinessProfile
);

// Location routes
router.post(
  "/:businessId/locations",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    body("address").isString().notEmpty(),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("city").isString().notEmpty(),
    body("district").isString().notEmpty(),
    body("postal_code").isString().notEmpty(),
    body("is_main_location").isBoolean().optional(),
    body("phone").isString().notEmpty(),
    body("working_hours").isString().notEmpty(),
    // Branch creation validation
    body("create_branch").optional().isBoolean(),
    body("branch_data")
      .optional()
      .isObject()
      .if(body("create_branch").equals(String(true))),
    body("branch_data.name")
      .if(body("create_branch").equals(String(true)))
      .isString()
      .notEmpty(),
    body("branch_data.branch_code")
      .if(body("create_branch").equals(String(true)))
      .isString()
      .notEmpty(),
    body("branch_data.manager_name")
      .if(body("create_branch").equals(String(true)))
      .isString()
      .notEmpty(),
    body("branch_data.manager_email")
      .if(body("create_branch").equals(String(true)))
      .isEmail(),
    body("branch_data.manager_phone")
      .if(body("create_branch").equals(String(true)))
      .isString()
      .notEmpty(),
    body("branch_data.operating_hours")
      .if(body("create_branch").equals(String(true)))
      .isObject(),
    body("branch_data.services")
      .if(body("create_branch").equals(String(true)))
      .isArray(),
    body("branch_data.services.*")
      .if(body("create_branch").equals(String(true)))
      .isString(),
  ],
  validate,
  businessController.addBusinessLocation
);

router.patch(
  "/:businessId/locations/:locationId",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    param("locationId").isUUID().withMessage("Invalid location ID"),
    body("address").optional().isString(),
    body("latitude").optional().isFloat({ min: -90, max: 90 }),
    body("longitude").optional().isFloat({ min: -180, max: 180 }),
    body("city").optional().isString(),
    body("district").optional().isString(),
    body("postal_code").optional().isString(),
    body("is_main_location").optional().isBoolean(),
    body("phone").optional().isString(),
    body("working_hours").optional().isString(),
  ],
  validate,
  businessController.updateBusinessLocation
);

router.delete(
  "/:businessId/locations/:locationId",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    param("locationId").isUUID().withMessage("Invalid location ID"),
  ],
  validate,
  businessController.deleteBusinessLocation
);

router.get(
  "/:businessId/locations",
  [param("businessId").isUUID().withMessage("Invalid business ID")],
  validate,
  businessController.getBusinessLocations
);

// Branch routes
router.post(
  "/:businessId/branches",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    body("location_id").isUUID().withMessage("Invalid location ID"),
    body("name").isString().notEmpty().withMessage("Branch name is required"),
    body("branch_code")
      .isString()
      .notEmpty()
      .withMessage("Branch code is required"),
    body("description").optional().isString(),
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
  businessController.addBranch
);

router.patch(
  "/:businessId/branches/:branchId",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    param("branchId").isUUID().withMessage("Invalid branch ID"),
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
  businessController.updateBranch
);

router.delete(
  "/:businessId/branches/:branchId",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    param("branchId").isUUID().withMessage("Invalid branch ID"),
  ],
  validate,
  businessController.deleteBranch
);

router.get(
  "/:businessId/branches/:branchId",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    param("branchId").isUUID().withMessage("Invalid branch ID"),
  ],
  validate,
  businessController.getBranch
);

router.get(
  "/:businessId/branches",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["ACTIVE", "INACTIVE"]),
    query("search").optional().isString(),
  ],
  validate,
  businessController.getBranches
);

// Business statistics
router.get(
  "/:businessId/stats",
  [
    param("businessId").isUUID().withMessage("Invalid business ID"),
    query("period").optional().isIn(["day", "week", "month", "year"]),
  ],
  validate,
  businessController.getBusinessStats
);

export default router;
