// src/docs/notification.doc.ts

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management and preferences
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The notification ID
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID of the notification recipient
 *         type:
 *           type: string
 *           enum: [RESERVATION_UPDATE, PAYMENT_UPDATE, LISTING_UPDATE, REVIEW_RECEIVED, PRICE_DROP, PICKUP_REMINDER]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message content
 *         is_read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         reference_id:
 *           type: string
 *           description: Optional ID of related entity (reservation, listing, etc.)
 *         reference_type:
 *           type: string
 *           description: Optional type of related entity
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     NotificationPreferences:
 *       type: object
 *       properties:
 *         email_notifications:
 *           type: boolean
 *           description: Whether to receive email notifications
 *         push_notifications:
 *           type: boolean
 *           description: Whether to receive push notifications
 *         sms_notifications:
 *           type: boolean
 *           description: Whether to receive SMS notifications
 *         notification_types:
 *           type: array
 *           items:
 *             type: string
 *             enum: [RESERVATION_UPDATE, PAYMENT_UPDATE, LISTING_UPDATE, REVIEW_RECEIVED, PRICE_DROP, PICKUP_REMINDER]
 *           description: Types of notifications to receive
 *
 *     NotificationList:
 *       type: object
 *       properties:
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of notifications
 *             page:
 *               type: integer
 *               description: Current page number
 *             limit:
 *               type: integer
 *               description: Items per page
 *             total_pages:
 *               type: integer
 *               description: Total number of pages
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     description: Retrieve user's notifications with pagination and filters
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [RESERVATION_UPDATE, PAYMENT_UPDATE, LISTING_UPDATE, REVIEW_RECEIVED, PRICE_DROP, PICKUP_REMINDER]
 *         description: Filter by notification type
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/NotificationList'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *
 * /api/notifications/preferences:
 *   get:
 *     summary: Get notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's notification preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *
 *   patch:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_notifications:
 *                 type: boolean
 *               push_notifications:
 *                 type: boolean
 *               sms_notifications:
 *                 type: boolean
 *               notification_types:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [RESERVATION_UPDATE, PAYMENT_UPDATE, LISTING_UPDATE, REVIEW_RECEIVED, PRICE_DROP, PICKUP_REMINDER]
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                   type: string
 *                   example: error
 *               message:
 *                   type: string
 *                   example: Not authorized to access this route
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 */
