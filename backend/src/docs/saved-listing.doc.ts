// src/docs/saved-listing.docs.ts

/**
 * @swagger
 * tags:
 *   - name: Saved Listings
 *     description: APIs for managing saved food listings for customers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SavedListing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *           description: Unique identifier for the saved listing
 *         customer_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *           description: ID of the customer who saved the listing
 *         listing_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *           description: ID of the saved food listing
 *         notes:
 *           type: string
 *           nullable: true
 *           example: "Great deal, must try!"
 *           description: Optional personal notes about the saved listing
 *         notification_enabled:
 *           type: boolean
 *           default: true
 *           example: true
 *           description: Whether notifications are enabled for this saved listing
 *         saved_at:
 *           type: string
 *           format: date-time
 *           example: "2024-02-11T15:30:00Z"
 *           description: Timestamp when the listing was saved
 *         listing:
 *           type: object
 *           description: Details of the saved food listing
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             title:
 *               type: string
 *               example: "Fresh Bread"
 *             description:
 *               type: string
 *               example: "Freshly baked artisan bread"
 *             price:
 *               type: number
 *               format: float
 *               example: 3.99
 *             original_price:
 *               type: number
 *               format: float
 *               example: 7.99
 *             quantity:
 *               type: integer
 *               example: 5
 *             unit:
 *               type: string
 *               example: "pieces"
 *             expiry_date:
 *               type: string
 *               format: date-time
 *             pickup_start:
 *               type: string
 *               format: date-time
 *             pickup_end:
 *               type: string
 *               format: date-time
 *             status:
 *               type: string
 *               enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *             business:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 company_name:
 *                   type: string
 *                   example: "Local Bakery"
 *                 is_verified:
 *                   type: boolean
 *             location:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 city:
 *                   type: string
 *                   example: "New York"
 *                 district:
 *                   type: string
 *                   example: "Manhattan"
 *
 *     SavedListingResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/SavedListing'
 *
 *     SavedListingsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           type: object
 *           properties:
 *             saved_listings:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SavedListing'
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 50
 *                   description: Total number of saved listings
 *                 page:
 *                   type: integer
 *                   example: 1
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                   description: Items per page
 *                 total_pages:
 *                   type: integer
 *                   example: 5
 *                   description: Total number of pages
 *
 *     SavedStatusResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           type: object
 *           properties:
 *             is_saved:
 *               type: boolean
 *               example: true
 *               description: Whether the listing is saved by the customer
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *         message:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * /api/saved-listings:
 *   get:
 *     summary: Get all saved listings
 *     description: Retrieve all food listings saved by the authenticated customer with pagination
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved saved listings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavedListingsListResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 saved_listings:
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     customer_id: "123e4567-e89b-12d3-a456-426614174001"
 *                     listing_id: "123e4567-e89b-12d3-a456-426614174002"
 *                     notes: "Great deal!"
 *                     notification_enabled: true
 *                     saved_at: "2024-02-11T15:30:00Z"
 *                     listing:
 *                       title: "Fresh Bread"
 *                       price: 3.99
 *                       status: "AVAILABLE"
 *                 pagination:
 *                   total: 50
 *                   page: 1
 *                   limit: 10
 *                   total_pages: 5
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Not authorized to access this route"
 *       403:
 *         description: Forbidden - User is not a customer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Access forbidden. Customer access only."
 */

/**
 * @swagger
 * /api/saved-listings/{listingId}:
 *   post:
 *     summary: Save a food listing
 *     description: Save a food listing for the authenticated customer with optional notes and notification preferences
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the food listing to save
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Remember to pick up before 6 PM"
 *               notification_enabled:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *           example:
 *             notes: "Remember to pick up before 6 PM"
 *             notification_enabled: true
 *     responses:
 *       201:
 *         description: Food listing saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavedListingResponse'
 *       400:
 *         description: Bad request - Listing already saved or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Food listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   patch:
 *     summary: Update a saved listing
 *     description: Update notes or notification settings for a saved listing
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the saved food listing to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Updated pickup notes"
 *               notification_enabled:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Saved listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavedListingResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Saved listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Remove a saved listing
 *     description: Remove a food listing from saved items
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the saved food listing to remove
 *     responses:
 *       204:
 *         description: Listing removed from saved items successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Saved listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/saved-listings/{listingId}/status:
 *   get:
 *     summary: Check saved status
 *     description: Check if a food listing is saved by the authenticated customer
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the food listing to check
 *     responses:
 *       200:
 *         description: Successfully retrieved saved status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavedStatusResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 is_saved: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT Authorization header using the Bearer scheme
 */
