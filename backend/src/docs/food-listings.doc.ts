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
 *         - location_id
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
 *         is_halal:
 *           type: boolean
 *           default: false
 *           description: Whether the food is halal certified
 *         preparation_time:
 *           type: string
 *           description: Time needed for preparation
 *         storage_instructions:
 *           type: string
 *           description: Instructions for food storage
 *         location_id:
 *           type: string
 *           format: uuid
 *           description: ID of the business location
 *         location:
 *           $ref: '#/components/schemas/Location'
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
 *               - is_halal
 *               - location_id
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
 *               is_halal:
 *                 type: boolean
 *                 description: Whether the food is halal certified
 *               preparation_time:
 *                 type: string
 *                 description: Time needed for preparation (optional)
 *               storage_instructions:
 *                 type: string
 *                 description: Instructions for food storage (optional)
 *               location_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the business location
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
 *         name: isHalal
 *         schema:
 *           type: boolean
 *         description: Filter halal items
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
 *         name: locationId
 *         schema:
 *           type: string
 *         description: Filter by location ID
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
