// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { telegramAuthController } from "./../controllers/telegram-auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/google", authController.googleAuth);
router.post("/apple", authController.appleAuth);
router.post("/telegram", telegramAuthController.authenticate);

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("role")
      .isIn(["CUSTOMER", "BUSINESS", "ADMIN"])
      .withMessage("Role must be either CUSTOMER, BUSINESS, or ADMIN"),
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

router.post(
  "/verify-telegram",
  protect,
  authController.startTelegramVerification
);

router.get(
  "/verify-telegram/status",
  protect,
  authController.getTelegramVerificationStatus
);

export default router;
