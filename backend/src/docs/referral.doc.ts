// src/docs/referral.doc.ts

/**
 * @swagger
 * tags:
 *   name: Referrals
 *   description: Referral system management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferralCode:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *           example: "ABC123XY"
 *         usage_limit:
 *           type: integer
 *           example: 10
 *         times_used:
 *           type: integer
 *           example: 0
 *         reward_points:
 *           type: integer
 *           example: 100
 *         expires_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     ReferralUse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         referral_code_id:
 *           type: string
 *           format: uuid
 *         referred_user_id:
 *           type: string
 *           format: uuid
 *         referrer_user_id:
 *           type: string
 *           format: uuid
 *         points_awarded:
 *           type: integer
 *           example: 100
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     UserPoints:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         points_balance:
 *           type: integer
 *           example: 500
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/referrals/code:
 *   post:
 *     summary: Create a new referral code
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usage_limit:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum number of times the code can be used
 *                 example: 10
 *               reward_points:
 *                 type: integer
 *                 minimum: 1
 *                 description: Points awarded for using this code
 *                 example: 100
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration date for the code
 *     responses:
 *       201:
 *         description: Referral code created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ReferralCode'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * /api/referrals/apply:
 *   post:
 *     summary: Apply a referral code
 *     description: Apply a referral code to receive reward points
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: The referral code to apply
 *                 example: "ABC123XY"
 *     responses:
 *       200:
 *         description: Referral code applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ReferralUse'
 *       400:
 *         description: Invalid or expired code, or user has already used a referral code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/referrals/my-referrals:
 *   get:
 *     summary: Get user's referral history
 *     description: Retrieve all referrals made by the authenticated user
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral history retrieved successfully
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
 *                     referrals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           points_awarded:
 *                             type: integer
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           referred_user:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total_referrals:
 *                           type: integer
 *                           example: 5
 *                         total_points_earned:
 *                           type: integer
 *                           example: 500
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/referrals/points:
 *   get:
 *     summary: Get user's points balance
 *     description: Retrieve the current points balance for the authenticated user
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/UserPoints'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
