// src/docs/foodlisting.doc.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     FoodListing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the food listing
 *         title:
 *           type: string
 *           description: Title of the food listing
 *         description:
 *           type: string
 *           description: Detailed description of the food listing
 *         price:
 *           type: number
 *           format: float
 *           description: Discounted price of the food item
 *         original_price:
 *           type: number
 *           format: float
 *           description: Original price before discount
 *         quantity:
 *           type: integer
 *           description: Available quantity of the food item
 *         unit:
 *           type: string
 *           description: Unit of measurement (e.g., "pieces", "kg", "boxes")
 *         expiry_date:
 *           type: string
 *           format: date-time
 *           description: Expiration date and time of the food item
 *         pickup_start:
 *           type: string
 *           format: date-time
 *           description: Start time for pickup window
 *         pickup_end:
 *           type: string
 *           format: date-time
 *           description: End time for pickup window
 *         status:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *           description: Current status of the listing
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs for the food item
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         is_halal:
 *           type: boolean
 *           description: Indicates if the food item is halal
 *         preparation_time:
 *           type: string
 *           nullable: true
 *           description: Time required for preparation
 *         storage_instructions:
 *           type: string
 *           nullable: true
 *           description: Instructions for proper storage
 *         pickup_status:
 *           type: string
 *           enum: [expired, urgent, warning, normal]
 *           description: Current pickup urgency status
 *         business:
 *           $ref: '#/components/schemas/Business'
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *         remaining_pickup_hours:
 *           type: number
 *           format: float
 *           description: Hours remaining until pickup deadline
 *         formatted_time:
 *           type: string
 *           description: Human-readable remaining time
 *         is_urgent:
 *           type: boolean
 *           description: Indicates if pickup is urgent
 *
 *     FoodListingUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         original_price:
 *           type: number
 *           minimum: 0
 *         quantity:
 *           type: integer
 *           minimum: 1
 *         unit:
 *           type: string
 *         expiry_date:
 *           type: string
 *           format: date-time
 *         pickup_start:
 *           type: string
 *           format: date-time
 *         pickup_end:
 *           type: string
 *           format: date-time
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *         is_halal:
 *           type: boolean
 *         preparation_time:
 *           type: string
 *         storage_instructions:
 *           type: string
 *         location_id:
 *           type: string
 *           format: uuid
 *         category_ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *
 *     ListingStats:
 *       type: object
 *       properties:
 *         total_views:
 *           type: integer
 *           description: Total number of views for the listing
 *         total_reservations:
 *           type: integer
 *           description: Total number of reservations made
 *         completion_rate:
 *           type: number
 *           format: float
 *           description: Percentage of successful pickups
 *         average_rating:
 *           type: number
 *           format: float
 *           description: Average rating from reviews
 *
 * tags:
 *   name: Food Listings
 *   description: Food listing management endpoints
 *
 * /api/food-listings:
 *   get:
 *     summary: Get all food listings
 *     tags: [Food Listings]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *       - name: isHalal
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *       - name: businessId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: locationId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: branchId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: prioritizeUrgent
 *         in: query
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of food listings
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
 *                     listings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FoodListing'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create a new food listing
 *     tags: [Food Listings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - original_price
 *               - quantity
 *               - unit
 *               - expiry_date
 *               - pickup_start
 *               - pickup_end
 *               - location_id
 *               - category_ids
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               original_price:
 *                 type: number
 *                 minimum: 0
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               unit:
 *                 type: string
 *               expiry_date:
 *                 type: string
 *                 format: date-time
 *               pickup_start:
 *                 type: string
 *                 format: date-time
 *               pickup_end:
 *                 type: string
 *                 format: date-time
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_halal:
 *                 type: boolean
 *               preparation_time:
 *                 type: string
 *               storage_instructions:
 *                 type: string
 *               location_id:
 *                 type: string
 *                 format: uuid
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Created food listing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FoodListing'
 *
 * /api/food-listings/{listingId}:
 *   get:
 *     summary: Get a food listing by ID
 *     tags: [Food Listings]
 *     parameters:
 *       - name: listingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Food listing details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FoodListing'
 *       404:
 *         description: Listing not found
 *
 *   patch:
 *     summary: Update a food listing
 *     tags: [Food Listings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: listingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FoodListingUpdate'
 *     responses:
 *       200:
 *         description: Updated food listing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FoodListing'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Listing not found
 *
 *   delete:
 *     summary: Delete a food listing
 *     tags: [Food Listings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: listingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Listing deleted successfully
 *       400:
 *         description: Cannot delete listing with active reservations
 *       404:
 *         description: Listing not found
 *
 * /api/food-listings/business/listings:
 *   get:
 *     summary: Get business food listings
 *     tags: [Food Listings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *       - name: branchId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of business food listings
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
 *                     listings:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/FoodListing'
 *                           - type: object
 *                             properties:
 *                               stats:
 *                                 $ref: '#/components/schemas/ListingStats'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
