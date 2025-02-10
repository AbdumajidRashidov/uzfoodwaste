/**
 * @swagger
 * tags:
 *   name: Business
 *   description: Business management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         business_id:
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
 *         is_main_location:
 *           type: boolean
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
 *         user_id:
 *           type: string
 *           format: uuid
 *         company_name:
 *           type: string
 *         legal_name:
 *           type: string
 *         tax_number:
 *           type: string
 *         business_license:
 *           type: string
 *         business_type:
 *           type: string
 *         registration_number:
 *           type: string
 *         is_verified:
 *           type: boolean
 *         verification_documents:
 *           type: string
 *         logo:
 *           type: string
 *         website:
 *           type: string
 *         working_hours:
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
 *             created_at:
 *               type: string
 *               format: date-time
 */
/**
 * @swagger
 * /api/businesses:
 *   get:
 *     summary: Get all businesses
 *     description: Retrieve a list of all businesses with optional filtering and pagination
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for company name, legal name, or business type
 *     responses:
 *       200:
 *         description: List of businesses retrieved successfully
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
 *                     businesses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Business'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of businesses
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/businesses/{businessId}:
 *   get:
 *     summary: Get business profile
 *     description: Retrieve a business profile by ID including user details and locations
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The business ID
 *     responses:
 *       200:
 *         description: Business profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/businesses/{businessId}:
 *   patch:
 *     summary: Update business profile
 *     description: Update business profile information
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               legal_name:
 *                 type: string
 *               tax_number:
 *                 type: string
 *               business_license:
 *                 type: string
 *               business_type:
 *                 type: string
 *               registration_number:
 *                 type: string
 *               verification_documents:
 *                 type: string
 *               logo:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               working_hours:
 *                 type: string
 *     responses:
 *       200:
 *         description: Business profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Business not found
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/businesses/{businessId}/locations:
 *   post:
 *     summary: Add a new business location
 *     description: Add a new location for a business
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - latitude
 *               - longitude
 *               - city
 *               - district
 *               - postal_code
 *               - phone
 *               - working_hours
 *             properties:
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 format: float
 *                 minimum: -180
 *                 maximum: 180
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               is_main_location:
 *                 type: boolean
 *               phone:
 *                 type: string
 *               working_hours:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Business not found
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/businesses/{businessId}/locations/{locationId}:
 *   patch:
 *     summary: Update business location
 *     description: Update an existing business location
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The business ID
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 format: float
 *                 minimum: -180
 *                 maximum: 180
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               is_main_location:
 *                 type: boolean
 *               phone:
 *                 type: string
 *               working_hours:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Location not found
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/businesses/{businessId}/locations/{locationId}:
 *   delete:
 *     summary: Delete business location
 *     description: Delete a business location. Cannot delete the only location of a business.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The business ID
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The location ID
 *     responses:
 *       200:
 *         description: Location deleted successfully
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
 *                     message:
 *                       type: string
 *                       example: Location deleted successfully
 *       400:
 *         description: Cannot delete the only location
 *       404:
 *         description: Location not found
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/businesses/{businessId}/locations:
 *   get:
 *     summary: Get all business locations
 *     description: Retrieve all locations for a business
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The business ID
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
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
 *                     $ref: '#/components/schemas/Location'
 *       404:
 *         description: Business not found
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/businesses/{businessId}/stats:
 *   get:
 *     summary: Get business statistics
 *     description: Retrieve statistics for a business including total listings, active listings, total reservations, and average rating
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The business ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     total_listings:
 *                       type: integer
 *                       description: Total number of listings
 *                       example: 25
 *                     active_listings:
 *                       type: integer
 *                       description: Number of currently active listings
 *                       example: 10
 *                     total_reservations:
 *                       type: integer
 *                       description: Total number of reservations
 *                       example: 150
 *                     average_rating:
 *                       type: number
 *                       format: float
 *                       description: Average rating of the business
 *                       example: 4.5
 *       404:
 *         description: Business not found
 *       401:
 *         description: Unauthorized
 */
