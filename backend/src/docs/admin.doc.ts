// src/docs/admin.doc.ts

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create a new admin user
 *     description: Create another admin user (only existing admins can create new admins)
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
 *         description: Admin created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users with filtering options (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, CUSTOMER, BUSINESS]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for email or phone
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */

/**
 * @swagger
 * /api/admin/businesses/{businessId}/verify:
 *   patch:
 *     summary: Verify a business
 *     description: Mark a business as verified (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: The business ID
 *     responses:
 *       200:
 *         description: Business verified successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Business not found
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     description: Retrieve system-wide statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_users:
 *                   type: integer
 *                 total_businesses:
 *                   type: integer
 *                 total_customers:
 *                   type: integer
 *                 total_listings:
 *                   type: integer
 *                 total_reservations:
 *                   type: integer
 *                 average_rating:
 *                   type: number
 *                   format: float
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
