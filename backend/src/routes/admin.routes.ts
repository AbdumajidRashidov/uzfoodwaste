// src/routes/admin.routes.ts
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(protect);
router.use(authorize("ADMIN"));

// Create another admin
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

// Get all users with filtering
router.get("/users", adminController.getAllUsers);

// Verify a business
router.patch("/businesses/:businessId/verify", adminController.verifyBusiness);

// Get system statistics
router.get("/stats", adminController.getSystemStats);

export default router;
