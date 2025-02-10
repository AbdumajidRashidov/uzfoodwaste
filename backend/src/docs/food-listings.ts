// src/docs/food-listing.doc.ts

/**
 * @swagger
 * tags:
 *   name: Food Listings
 *   description: Food listing management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *
 *     Location:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         address:
 *           type: string
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *         city:
 *           type: string
 *         district:
 *           type: string
 *         postal_code:
 *           type: string
 *         phone:
 *           type: string
 *         working_hours:
 *           type: string
 *
 *     Business:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         company_name:
 *           type: string
 *         legal_name:
 *           type: string
 *         is_verified:
 *           type: boolean
 *         logo:
 *           type: string
 *         website:
 *           type: string
 *
 *     FoodListing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         business_id:
 *           type: string
 *           format: uuid
 *         location_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         original_price:
 *           type: number
 *           format: float
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
 *         status:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         is_halal:
 *           type: boolean
 *         preparation_time:
 *           type: string
 *         storage_instructions:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         business:
 *           $ref: '#/components/schemas/Business'
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ListingCategory'
 *
 *     ListingCategory:
 *       type: object
 *       properties:
 *         listing_id:
 *           type: string
 *           format: uuid
 *         category_id:
 *           type: string
 *           format: uuid
 *         category:
 *           $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /api/food-listings:
 *   get:
 *     summary: Get all food listings
 *     description: Retrieve food listings with optional filtering and pagination
 *     tags: [Food Listings]
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
 *         description: Category ID to filter by
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: isHalal
 *         schema:
 *           type: boolean
 *         description: Filter by halal status
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
 *                       $ref: '#/components/schemas/PaginationResponse'
 *
 *   post:
 *     summary: Create a new food listing
 *     tags: [Food Listings]
 *     security:
 *       - bearerAuth: []
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
 *               - category_ids
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *               original_price:
 *                 type: number
 *                 format: float
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
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: string
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
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
/**
 * @swagger
 * /api/food-listings/{listingId}:
 *   get:
 *     summary: Get a food listing by ID
 *     tags: [Food Listings]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The food listing ID
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
 *         $ref: '#/components/responses/NotFoundError'
 */
/**
 * @swagger
 * /api/food-listings/{listingId}:
 *   patch:
 *     summary: Update a food listing
 *     tags: [Food Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The food listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *               original_price:
 *                 type: number
 *                 format: float
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
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *               is_halal:
 *                 type: boolean
 *               preparation_time:
 *                 type: string
 *               storage_instructions:
 *                 type: string
 *               location_id:
 *                 type: string
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: string
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
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   delete:
 *     summary: Delete a food listing
 *     tags: [Food Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The food listing ID
 *     responses:
 *       204:
 *         description: Food listing deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of items
 *           example: 100
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Items per page
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 10
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Error message description
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Not authorized to access this route
 *
 *     ForbiddenError:
 *       description: Not authorized to perform this action
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: User role not authorized to access this route
 *
 *     ValidationError:
 *       description: Invalid input data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Invalid input data. Title is required.
 *
 *     NotFoundError:
 *       description: Requested resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Resource not found
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         JWT Authorization header using the Bearer scheme.
 *         Example: "Authorization: Bearer {token}"
 *
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number for pagination
 *
 *     LimitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Number of items per page
 *
 *     ListingIdParam:
 *       in: path
 *       name: listingId
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: ID of the food listing
 */
/**
 * @swagger
 * /api/food-listings/business/listings:
 *   get:
 *     summary: Get business's own listings
 *     description: Retrieve all food listings for the authenticated business
 *     tags: [Food Listings]
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
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, SOLD]
 *         description: Filter by listing status
 *     responses:
 *       200:
 *         description: List of business's food listings
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
 *                           description: Total number of listings
 *                           example: 50
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a business account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: User role not authorized to access this route
 */
