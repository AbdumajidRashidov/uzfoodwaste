// src/routes/banner.routes.ts
import { Router } from "express";
import { BannerController } from "../controllers/banner.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const router = Router();
const bannerController = new BannerController();

// Protect all routes - only admin access
router.use(protect);
router.use(authorize("ADMIN"));

// Create banner
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("image").notEmpty().withMessage("Image is required"),
    body("title1").optional().isString(),
    body("title2").optional().isString(),
    body("btnText").optional().isString(),
    body("description1").optional().isString(),
    body("description2").optional().isString(),
    body("isActive").optional().isBoolean(),
    body("order").optional().isInt({ min: 0 }),
  ],
  validate,
  bannerController.createBanner
);

// Update banner
router.patch(
  "/:bannerId",
  [
    body("title").optional().isString(),
    body("image").optional().isString(),
    body("title1").optional().isString(),
    body("title2").optional().isString(),
    body("btnText").optional().isString(),
    body("description1").optional().isString(),
    body("description2").optional().isString(),
    body("isActive").optional().isBoolean(),
    body("order").optional().isInt({ min: 0 }),
  ],
  validate,
  bannerController.updateBanner
);

// Delete banner
router.delete("/:bannerId", bannerController.deleteBanner);

// Get single banner
router.get("/:bannerId", bannerController.getBanner);

// Get all banners
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("isActive").optional().isBoolean(),
  ],
  validate,
  bannerController.getAllBanners
);

// Update banner order
router.patch(
  "/order/bulk",
  [
    body().isArray().withMessage("Request body must be an array"),
    body("*.id").notEmpty().withMessage("Banner ID is required"),
    body("*.order")
      .isInt({ min: 0 })
      .withMessage("Order must be a positive integer"),
  ],
  validate,
  bannerController.updateBannerOrder
);

export default router;
