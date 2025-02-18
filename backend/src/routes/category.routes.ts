// src/routes/category.routes.ts
import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategory);

// Protected routes - only admin can manage categories
router.use(protect);
router.use(authorize("ADMIN"));

// Create category
router.post(
  "/",
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("description")
      .isString()
      .notEmpty()
      .withMessage("Description is required"),
    body("image").isString().notEmpty().withMessage("image is required"),
  ],
  validate,
  categoryController.createCategory
);

// Update category
router.patch(
  "/:categoryId",
  [
    body("name").optional().isString().withMessage("Name must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("image").optional().isString().withMessage("Image must be a string"),
  ],
  validate,
  categoryController.updateCategory
);

// Delete category
router.delete("/:categoryId", categoryController.deleteCategory);

export default router;
