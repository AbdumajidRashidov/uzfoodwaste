// src/docs/telegram.doc.ts

/**
 * @swagger
 * tags:
 *   name: Telegram Verification
 *   description: Phone number verification via Telegram bot
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TelegramVerification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         user_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, EXPIRED]
 *           example: "PENDING"
 *         verified_phone:
 *           type: string
 *           example: "+1234567890"
 *           nullable: true
 *         verified_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         expires_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     TelegramVerificationStart:
 *       type: object
 *       properties:
 *         bot_link:
 *           type: string
 *           example: "https://t.me/YourBotName?start=verification_token"
 *           description: Telegram bot link with verification token
 *         expires_in:
 *           type: integer
 *           example: 1800
 *           description: Time in seconds until the verification expires
 *
 *     TelegramVerificationStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, EXPIRED]
 *           example: "COMPLETED"
 *         verified_phone:
 *           type: string
 *           example: "+1234567890"
 *           nullable: true
 *           description: The verified phone number (only present if status is COMPLETED)
 */

/**
 * @swagger
 * /api/auth/verify-telegram:
 *   post:
 *     summary: Start Telegram phone verification
 *     description: |
 *       Initiates the phone verification process via Telegram bot.
 *       Returns a bot link that the user should open in Telegram.
 *     tags: [Telegram Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification process started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/TelegramVerificationStart'
 *             example:
 *               status: "success"
 *               data:
 *                 bot_link: "https://t.me/YourBotName?start=verification_token"
 *                 expires_in: 1800
 *       401:
 *         description: Unauthorized - Valid JWT token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Not authorized to access this route"
 *       400:
 *         description: Bad request - Previous verification might be in progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Active verification already exists"
 *
 * /api/auth/verify-telegram/status:
 *   get:
 *     summary: Check Telegram verification status
 *     description: |
 *       Checks the status of an ongoing phone verification process.
 *       Use this endpoint to poll for verification completion.
 *     tags: [Telegram Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current verification status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/TelegramVerificationStatus'
 *             examples:
 *               pending:
 *                 value:
 *                   status: "success"
 *                   data:
 *                     status: "PENDING"
 *                     verified_phone: null
 *               completed:
 *                 value:
 *                   status: "success"
 *                   data:
 *                     status: "COMPLETED"
 *                     verified_phone: "+1234567890"
 *       401:
 *         description: Unauthorized - Valid JWT token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No verification found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "No verification found"
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtained during login
 */
