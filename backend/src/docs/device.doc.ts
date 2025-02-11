// src/docs/device.doc.ts

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device management and phone verification endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserDevice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The device ID
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID of the device owner
 *         fcm_token:
 *           type: string
 *           description: Firebase Cloud Messaging token
 *         device_type:
 *           type: string
 *           enum: [android, ios, web]
 *           description: Type of device
 *         device_name:
 *           type: string
 *           description: Optional device name/description
 *         last_used_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last device usage
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     DeviceRegistration:
 *       type: object
 *       required:
 *         - fcm_token
 *         - device_type
 *       properties:
 *         fcm_token:
 *           type: string
 *           description: Firebase Cloud Messaging token
 *         device_type:
 *           type: string
 *           enum: [android, ios, web]
 *           description: Type of device
 *         device_name:
 *           type: string
 *           description: Optional device name/description
 *
 *     TokenUpdate:
 *       type: object
 *       required:
 *         - old_token
 *         - new_token
 *       properties:
 *         old_token:
 *           type: string
 *           description: Current FCM token
 *         new_token:
 *           type: string
 *           description: New FCM token to update to
 *
 *     PhoneVerification:
 *       type: object
 *       required:
 *         - phone_number
 *       properties:
 *         phone_number:
 *           type: string
 *           pattern: ^\+[1-9]\d{1,14}$
 *           example: "+1234567890"
 *           description: Phone number with country code
 *
 *     PhoneVerificationConfirmation:
 *       type: object
 *       required:
 *         - phone_number
 *         - code
 *       properties:
 *         phone_number:
 *           type: string
 *           pattern: ^\+[1-9]\d{1,14}$
 *           example: "+1234567890"
 *           description: Phone number with country code
 *         code:
 *           type: string
 *           minLength: 4
 *           maxLength: 10
 *           description: Verification code received via SMS
 */

/**
 * @swagger
 * /api/devices/register:
 *   post:
 *     summary: Register a device for push notifications
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceRegistration'
 *     responses:
 *       200:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/UserDevice'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *
 * /api/devices/unregister:
 *   post:
 *     summary: Unregister a device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcm_token
 *             properties:
 *               fcm_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device unregistered successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 *
 * /api/devices/token:
 *   patch:
 *     summary: Update device FCM token
 *     description: Update the FCM token when it changes
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenUpdate'
 *     responses:
 *       200:
 *         description: Token updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/UserDevice'
 *       404:
 *         description: Device not found
 *
 * /api/devices/status/{fcm_token}:
 *   get:
 *     summary: Get device registration status
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fcm_token
 *         required: true
 *         schema:
 *           type: string
 *         description: FCM token to check
 *     responses:
 *       200:
 *         description: Device status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_registered:
 *                       type: boolean
 *                     device:
 *                       $ref: '#/components/schemas/UserDevice'
 *
 * /api/devices:
 *   get:
 *     summary: Get user's registered devices
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDevice'
 *
 * /api/devices/verify-phone:
 *   post:
 *     summary: Start phone verification process
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneVerification'
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification_sid:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, canceled]
 *       400:
 *         description: Invalid phone number format
 *
 * /api/devices/confirm-phone:
 *   post:
 *     summary: Confirm phone verification code
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneVerificationConfirmation'
 *     responses:
 *       200:
 *         description: Phone verification status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [approved, pending, canceled]
 *                     valid:
 *                       type: boolean
 *       400:
 *         description: Invalid verification code
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 */
