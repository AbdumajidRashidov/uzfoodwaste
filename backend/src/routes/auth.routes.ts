// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const authController = new AuthController();

router.post("/google", authController.googleAuth);

router.post("/apple", authController.appleAuth);

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("role")
      .isIn(["CUSTOMER", "BUSINESS"])
      .withMessage("Role must be either CUSTOMER or BUSINESS"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  authController.resetPassword
);

export default router;
