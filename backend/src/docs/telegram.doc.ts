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
// src/docs/telegram-auth.doc.ts

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TelegramAuthData:
 *       type: object
 *       required:
 *         - id
 *         - auth_date
 *         - hash
 *       properties:
 *         id:
 *           type: number
 *           description: Telegram user ID
 *           example: 12345678
 *         first_name:
 *           type: string
 *           description: User's first name from Telegram
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: User's last name from Telegram
 *           example: "Doe"
 *         username:
 *           type: string
 *           description: User's Telegram username
 *           example: "johndoe"
 *         photo_url:
 *           type: string
 *           description: URL of user's Telegram profile photo
 *           example: "https://t.me/i/userpic/123/photo.jpg"
 *         auth_date:
 *           type: number
 *           description: Authentication timestamp (Unix time)
 *           example: 1707307200
 *         hash:
 *           type: string
 *           description: Authentication data hash
 *           example: "a5c7d8e9f0b1c2d3e4f5a6b7c8d9e0f1"
 *
 *     TelegramAuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT token for authentication
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: User's internal ID
 *                 telegram_id:
 *                   type: string
 *                   description: User's Telegram ID
 *                 role:
 *                   type: string
 *                   enum: [CUSTOMER, BUSINESS, ADMIN]
 *                   description: User's role in the system
 *                 is_verified:
 *                   type: boolean
 *                   description: Whether the user is verified
 *
 *     TelegramAuthError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *         message:
 *           type: string
 *           example: "Invalid authentication data"
 */

/**
 * @swagger
 * /api/auth/telegram:
 *   post:
 *     summary: Authenticate with Telegram
 *     description: |
 *       Authenticate using Telegram Login Widget data. To test this endpoint:
 *
 *       1. Add the Telegram Login Widget to your frontend
 *       2. Configure the widget with your bot username
 *       3. When user clicks the widget, it will provide authentication data
 *       4. Send that data to this endpoint
 *
 *       Note: The authentication data includes a hash that is verified using your bot token.
 *       The hash prevents tampering with the authentication data.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TelegramAuthData'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TelegramAuthResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   telegram_id: "12345678"
 *                   role: "CUSTOMER"
 *                   is_verified: true
 *       400:
 *         description: Missing or invalid authentication data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TelegramAuthError'
 *             example:
 *               status: "error"
 *               message: "Missing required Telegram authentication data"
 *       401:
 *         description: Invalid authentication (hash mismatch or expired data)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TelegramAuthError'
 *             example:
 *               status: "error"
 *               message: "Invalid authentication data"
 *     x-codeSamples:
 *       - lang: 'JavaScript'
 *         source: |
 *           // Frontend code with Telegram Widget
 *           <script async src="https://telegram.org/js/telegram-widget.js?22"></script>
 *
 *           window.onTelegramAuth = function(user) {
 *             fetch('/api/auth/telegram', {
 *               method: 'POST',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               },
 *               body: JSON.stringify(user)
 *             })
 *             .then(response => response.json())
 *             .then(data => {
 *               // Handle successful authentication
 *               localStorage.setItem('token', data.token);
 *             })
 *             .catch(error => console.error('Authentication failed:', error));
 *           };
 *
 *           // Telegram Login Widget
 *           <script
 *             async
 *             data-telegram-login="YOUR_BOT_USERNAME"
 *             data-size="large"
 *             data-onauth="onTelegramAuth(user)"
 *             data-request-access="write">
 *           </script>
 */
