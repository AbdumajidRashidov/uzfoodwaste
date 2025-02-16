// src/docs/admin.doc.ts

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DetailedSystemStats:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *             total_businesses:
 *               type: integer
 *             total_customers:
 *               type: integer
 *             total_listings:
 *               type: integer
 *             total_reservations:
 *               type: integer
 *             average_rating:
 *               type: number
 *               format: float
 *         user_stats:
 *           type: object
 *           properties:
 *             by_role:
 *               type: array
 *               items:
 *                 type: object
 *             verification_rate:
 *               type: number
 *               format: float
 *         business_stats:
 *           type: object
 *           properties:
 *             verification_data:
 *               type: array
 *               items:
 *                 type: object
 *             verification_rate:
 *               type: number
 *               format: float
 *
 *     BusinessAnalytics:
 *       type: object
 *       properties:
 *         business_info:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             company_name:
 *               type: string
 *             is_verified:
 *               type: boolean
 *             total_locations:
 *               type: integer
 *         performance_metrics:
 *           type: object
 *           properties:
 *             total_listings:
 *               type: integer
 *             active_listings:
 *               type: integer
 *             total_reservations:
 *               type: integer
 *             completed_reservations:
 *               type: integer
 *             completion_rate:
 *               type: number
 *               format: float
 *             average_rating:
 *               type: number
 *               format: float
 *
 *     UserAnalytics:
 *       type: object
 *       properties:
 *         user_overview:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *             verified_users:
 *               type: integer
 *             customer_count:
 *               type: integer
 *             business_count:
 *               type: integer
 *         customer_metrics:
 *           type: object
 *           properties:
 *             engagement:
 *               type: array
 *               items:
 *                 type: object
 *             average_reservations_per_customer:
 *               type: number
 *             average_reviews_per_customer:
 *               type: number
 */

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - phone
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not an admin
 *
 * /api/admin/users:
 *   get:
 *     summary: Get all users with filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, CUSTOMER, BUSINESS]
 *         description: Filter by user role
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *
 * /api/admin/stats/detailed:
 *   get:
 *     summary: Get detailed system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedSystemStats'
 *
 * /api/admin/analytics/business/{businessId}:
 *   get:
 *     summary: Get business analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessAnalytics'
 *
 * /api/admin/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAnalytics'
 *
 * /api/admin/businesses/{businessId}/verify:
 *   patch:
 *     summary: Verify a business
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business verified successfully
 *
 * /api/admin/businesses/verify-bulk:
 *   post:
 *     summary: Bulk verify businesses
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_ids
 *               - is_verified
 *             properties:
 *               business_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Businesses updated successfully
 *
 * /api/admin/listings/manage:
 *   post:
 *     summary: Manage food listings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - listing_ids
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [ACTIVATE, DEACTIVATE, DELETE]
 *               listing_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               business_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Listings managed successfully
 *
 * /api/admin/analytics/business/{businessId}/export:
 *   get:
 *     summary: Export business analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [JSON, CSV]
 *         default: JSON
 *     responses:
 *       200:
 *         description: Analytics exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessAnalytics'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
