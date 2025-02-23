// src/docs/food-listings.doc.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - address
 *         - latitude
 *         - longitude
 *         - city
 *         - district
 *         - postal_code
 *         - phone
 *         - working_hours
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the location
 *         address:
 *           type: string
 *           description: Full address of the location
 *         latitude:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude coordinate
 *         city:
 *           type: string
 *           description: City name
 *         district:
 *           type: string
 *           description: District or area within the city
 *         postal_code:
 *           type: string
 *           description: Postal or ZIP code
 *         is_main_location:
 *           type: boolean
 *           default: false
 *           description: Whether this is the main location for the business
 *         phone:
 *           type: string
 *           description: Contact phone number for this location
 *         working_hours:
 *           type: string
 *           description: Operating hours for this location
 *
 *     Branch:
 *       type: object
 *       required:
 *         - name
 *         - business_id
 *         - location_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the branch
 *         name:
 *           type: string
 *           description: Name of the branch
 *         business_id:
 *           type: string
 *           format: uuid
 *           description: ID of the parent business
 *         location_id:
 *           type: string
 *           format: uuid
 *           description: ID of the branch location
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           default: ACTIVE
 *           description: Current status of the branch
 *
 *     FoodListing:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - original_price
 *         - quantity
 *         - unit
 *         - expiry_date
 *         - pickup_start
 *         - pickup_end
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the food listing
 *         title:
 *           type: string
 *           description: The title of the food listing
 *         description:
 *           type: string
 *           description: Detailed description of the food listing
 *         price:
 *           type: number
 *           format: float
 *           description: Discounted price of the food listing
 *         original_price:
 *           type: number
 *           format: float
 *           description: Original price before discount
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Available quantity
 *         unit:
 *           type: string
 *           description: Unit of measurement (e.g., kg, pieces)
 *         expiry_date:
 *           type: string
 *           format: date-time
 *           description: Food expiration date and time
 *         pickup_start:
 *           type: string
 *           format: date-time
 *           description: Start time for pickup window
 *         pickup_end:
 *           type: string
 *           format: date-time
 *           description: End time for pickup window
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         status:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *           default: AVAILABLE
 *           description: Current status of the listing
 *         storage_instructions:
 *           type: string
 *           description: Instructions for food storage
 *         branch_id:
 *           type: string
 *           format: uuid
 *           description: Optional ID of the business branch
 *         branch:
 *           $ref: '#/components/schemas/Branch'
 *         pickup_status:
 *           type: string
 *           enum: [normal, warning, urgent, expired]
 *           description: Current pickup urgency status
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of category IDs
 *
 * /api/food-listings:
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
 *               - images
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the food listing
 *               description:
 *                 type: string
 *                 description: Detailed description of the food listing
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Discounted price of the food listing
 *               original_price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Original price before discount
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Available quantity
 *               unit:
 *                 type: string
 *                 description: Unit of measurement (e.g., kg, pieces)
 *               expiry_date:
 *                 type: string
 *                 format: date-time
 *                 description: Food expiration date and time
 *               pickup_start:
 *                 type: string
 *                 format: date-time
 *                 description: Start time for pickup window
 *               pickup_end:
 *                 type: string
 *                 format: date-time
 *                 description: End time for pickup window
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               storage_instructions:
 *                 type: string
 *                 description: Instructions for food storage (optional)
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of category IDs (optional)
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the business branch (optional)
 *     responses:
 *       201:
 *         description: Food listing created successfully
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
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not a business user
 *
 *   get:
 *     summary: Get all food listings with filters
 *     tags: [Food Listings]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title and description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *         description: Filter by listing status
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: Filter by business ID
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
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
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 * /api/food-listings/{listingId}:
 *   get:
 *     summary: Get a specific food listing
 *     tags: [Food Listings]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the food listing
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
 *         description: Food listing not found
 *
 *   patch:
 *     summary: Update a food listing
 *     tags: [Food Listings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the food listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FoodListing'
 *     responses:
 *       200:
 *         description: Food listing updated successfully
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the owner of the listing
 *       404:
 *         description: Food listing not found
 *
 *   delete:
 *     summary: Delete a food listing
 *     tags: [Food Listings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the food listing
 *     responses:
 *       204:
 *         description: Food listing deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the owner of the listing
 *       404:
 *         description: Food listing not found
 *
 * /api/food-listings/business/listings:
 *   get:
 *     summary: Get all listings for the authenticated business
 *     tags: [Food Listings]
 *     security:
 *       - BearerAuth: []
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *         description: Filter by listing status
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
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
 *                                 type: object
 *                                 properties:
 *                                   active_reservations:
 *                                     type: integer
 *                                   branch_name:
 *                                     type: string
 *                                   branch_status:
 *                                     type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a business user
 */

/**
 * @swagger
 * /api/food-listings/map-search:
 *   get:
 *     tags:
 *       - Food Listings
 *     summary: Search food listings by map location
 *     description: |
 *       Retrieve food listings within a specified radius of a geographical point.
 *       Results can be filtered by price, halal status, categories, and more.
 *       Distance is calculated from the search point to each listing.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the search center point
 *         example: 41.2995
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the search center point
 *         example: 69.2401
 *       - in: query
 *         name: radius
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 100
 *           maximum: 50000
 *         description: Search radius in meters
 *         example: 1000
 *       - in: query
 *         name: minPrice
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *         example: 10000
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *         example: 50000
 *       - in: query
 *         name: categories
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of category IDs
 *         example: "cat1,cat2"
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term for title and description
 *         example: "bread"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     listings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "123e4567-e89b-12d3-a456-426614174000"
 *                           title:
 *                             type: string
 *                             example: "Fresh Bread"
 *                           description:
 *                             type: string
 *                             example: "Freshly baked bread from our local bakery"
 *                           price:
 *                             type: number
 *                             example: 15000
 *                           original_price:
 *                             type: number
 *                             example: 20000
 *                           distance:
 *                             type: number
 *                             description: Distance in kilometers from search point
 *                             example: 0.75
 *                           quantity:
 *                             type: integer
 *                             example: 5
 *                           unit:
 *                             type: string
 *                             example: "loaf"
 *                           expiry_date:
 *                             type: string
 *                             format: date-time
 *                           pickup_start:
 *                             type: string
 *                             format: date-time
 *                           pickup_end:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *                           business:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               company_name:
 *                                 type: string
 *                                 example: "Local Bakery"
 *                               is_verified:
 *                                 type: boolean
 *                               logo:
 *                                 type: string
 *                                 format: uri
 *                           branch:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                                 example: "Downtown Branch"
 *                               branch_code:
 *                                 type: string
 *                                 example: "BRN001"
 *                               operating_hours:
 *                                 type: object
 *                           categories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 category:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                     name:
 *                                       type: string
 *                                       example: "Bakery"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 50
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total_pages:
 *                           type: integer
 *                           example: 5
 *       400:
 *         description: Bad Request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Invalid latitude value"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *     security:
 *       - BearerAuth: []
 */
