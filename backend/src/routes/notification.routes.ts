// src/routes/notification.routes.ts
import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";
import { NotificationType } from "@prisma/client";

const router = Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(protect);

/**
 * Get user's notifications with filters
 * GET /api/notifications
 */
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("type")
      .optional()
      .isIn(Object.values(NotificationType))
      .withMessage("Invalid notification type"),
    query("isRead")
      .optional()
      .isBoolean()
      .withMessage("isRead must be a boolean"),
  ],
  validate,
  notificationController.getUserNotifications
);

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:notificationId/read
 */
router.patch("/:notificationId/read", notificationController.markAsRead);

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * Get user's notification preferences
 * GET /api/notifications/preferences
 */
router.get("/preferences", notificationController.getPreferences);

/**
 * Update user's notification preferences
 * PATCH /api/notifications/preferences
 */
router.patch(
  "/preferences",
  [
    body("email_notifications")
      .optional()
      .isBoolean()
      .withMessage("email_notifications must be a boolean"),
    body("push_notifications")
      .optional()
      .isBoolean()
      .withMessage("push_notifications must be a boolean"),
    body("sms_notifications")
      .optional()
      .isBoolean()
      .withMessage("sms_notifications must be a boolean"),
    body("notification_types")
      .optional()
      .isArray()
      .withMessage("notification_types must be an array"),
    body("notification_types.*")
      .optional()
      .isIn(Object.values(NotificationType))
      .withMessage("Invalid notification type"),
  ],
  validate,
  notificationController.updatePreferences
);

export default router;
