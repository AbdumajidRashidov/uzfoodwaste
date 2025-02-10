// src/docs/customer.doc.ts

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management and operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         address:
 *           type: string
 *         birth_date:
 *           type: string
 *           format: date-time
 *         profile_picture:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             is_verified:
 *               type: boolean
 *             language_preference:
 *               type: string
 *
 *     SavedListing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customer_id:
 *           type: string
 *           format: uuid
 *         listing_id:
 *           type: string
 *           format: uuid
 *         saved_at:
 *           type: string
 *           format: date-time
 *         listing:
 *           $ref: '#/components/schemas/FoodListing'
 *
 *     CustomerReservation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *         pickup_time:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         listing:
 *           $ref: '#/components/schemas/FoodListing'
 *         payment_transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PaymentTransaction'
 *
 *     CustomerReview:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         images:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/customers/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Customer not found
 *
 *   patch:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               address:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date-time
 *               profile_picture:
 *                 type: string
 *               phone:
 *                 type: string
 *               language_preference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /api/customers/saved-listings:
 *   get:
 *     summary: Get customer's saved food listings
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved listings retrieved successfully
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
 *                     $ref: '#/components/schemas/SavedListing'
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /api/customers/saved-listings/{listingId}:
 *   post:
 *     summary: Save a food listing
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Listing saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/SavedListing'
 *       400:
 *         description: Listing already saved
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Food listing not found
 *
 *   delete:
 *     summary: Remove a saved food listing
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Listing removed from saved items
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Saved listing not found
 */

/**
 * @swagger
 * /api/customers/reservations:
 *   get:
 *     summary: Get customer's reservations
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *         description: Filter reservations by status
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully
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
 *                     $ref: '#/components/schemas/CustomerReservation'
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /api/customers/reviews:
 *   get:
 *     summary: Get customer's reviews
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
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
 *                     $ref: '#/components/schemas/CustomerReview'
 *       401:
 *         description: Not authorized
 */
