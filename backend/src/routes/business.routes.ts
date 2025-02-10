// src/routes/business.routes.ts
import { Router } from "express";
import { BusinessController } from "../controllers/business.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const businessController = new BusinessController();

router.get("/", protect, businessController.getAllBusinesses);

// Get business profile
router.get("/:businessId", protect, businessController.getBusinessProfile);

// Update business profile
router.patch(
  "/:businessId",
  protect,
  [
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

// Add business location
router.post(
  "/:businessId/locations",
  protect,
  [
    body("address").isString().notEmpty(),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("city").isString().notEmpty(),
    body("district").isString().notEmpty(),
    body("postal_code").isString().notEmpty(),
    body("is_main_location").isBoolean().optional(),
    body("phone").isString().notEmpty(),
    body("working_hours").isString().notEmpty(),
  ],
  validate,
  businessController.addBusinessLocation
);

// Update business location
router.patch(
  "/:businessId/locations/:locationId",
  protect,
  [
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

// Delete business location
router.delete(
  "/:businessId/locations/:locationId",
  protect,
  businessController.deleteBusinessLocation
);

// Get all business locations
router.get(
  "/:businessId/locations",
  protect,
  businessController.getBusinessLocations
);

// Get business statistics
router.get("/:businessId/stats", protect, businessController.getBusinessStats);

export default router;
