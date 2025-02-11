// src/routes/device.routes.ts
import { Router } from "express";
import { DeviceController } from "../controllers/device.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, param } from "express-validator";

const router = Router();
const deviceController = new DeviceController();

// All routes require authentication
router.use(protect);

// Register a device for push notifications
router.post(
  "/register",
  [
    body("fcm_token")
      .isString()
      .notEmpty()
      .withMessage("FCM token is required"),
    body("device_type")
      .isIn(["android", "ios", "web"])
      .withMessage("Invalid device type"),
    body("device_name").optional().isString(),
  ],
  validate,
  deviceController.registerDevice
);

// Unregister a device
router.post(
  "/unregister",
  [
    body("fcm_token")
      .isString()
      .notEmpty()
      .withMessage("FCM token is required"),
  ],
  validate,
  deviceController.unregisterDevice
);

// Update device token
router.patch(
  "/token",
  [
    body("old_token")
      .isString()
      .notEmpty()
      .withMessage("Old token is required"),
    body("new_token")
      .isString()
      .notEmpty()
      .withMessage("New token is required"),
  ],
  validate,
  deviceController.updateDeviceToken
);

// Get device status
router.get(
  "/status/:fcm_token",
  [
    param("fcm_token")
      .isString()
      .notEmpty()
      .withMessage("FCM token is required"),
  ],
  validate,
  deviceController.getDeviceStatus
);

// Get user's registered devices
router.get("/", deviceController.getUserDevices);

// Start phone verification
router.post(
  "/verify-phone",
  [
    body("phone_number")
      .matches(/^\+[1-9]\d{1,14}$/)
      .withMessage(
        "Invalid phone number format. Must include country code (e.g., +1234567890)"
      ),
  ],
  validate,
  deviceController.verifyPhone
);

// Confirm phone verification code
router.post(
  "/confirm-phone",
  [
    body("phone_number")
      .matches(/^\+[1-9]\d{1,14}$/)
      .withMessage(
        "Invalid phone number format. Must include country code (e.g., +1234567890)"
      ),
    body("code")
      .isString()
      .isLength({ min: 4, max: 10 })
      .withMessage("Invalid verification code"),
  ],
  validate,
  deviceController.confirmPhoneVerification
);

export default router;
