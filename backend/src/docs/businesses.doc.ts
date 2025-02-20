// src/docs/business.doc.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         branch_code:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         manager_name:
 *           type: string
 *         manager_email:
 *           type: string
 *           format: email
 *         manager_phone:
 *           type: string
 *         operating_hours:
 *           type: object
 *         services:
 *           type: array
 *           items:
 *             type: string
 *         policies:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         opening_date:
 *           type: string
 *           format: date-time
 *         food_listings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FoodListing'
 *         branch_reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BranchReview'
 *
 *     BusinessLocation:
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
 *         branch:
 *           $ref: '#/components/schemas/Branch'
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
 *         locations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BusinessLocation'
 *         branches:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Branch'
 *
 *     BranchStats:
 *       type: object
 *       properties:
 *         active_listings:
 *           type: integer
 *         average_rating:
 *           type: number
 *           format: float
 *         total_reviews:
 *           type: integer
 *         categories:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *
 *     BusinessStats:
 *       type: object
 *       properties:
 *         overall_stats:
 *           type: object
 *           properties:
 *             total_listings:
 *               type: integer
 *             active_listings:
 *               type: integer
 *             total_reservations:
 *               type: integer
 *             average_rating:
 *               type: number
 *               format: float
 *             total_active_branches:
 *               type: integer
 *         branch_stats:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BranchStats'
 *
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total_pages:
 *           type: integer
 *
 *   responses:
 *     NotFoundError:
 *       description: The specified resource was not found
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
 *
 *     ValidationError:
 *       description: Invalid input parameters
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
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Businesses
 *     description: Business management endpoints
 *   - name: Business Locations
 *     description: Business location management endpoints
 *   - name: Branches
 *     description: Branch management endpoints
 *
 * paths:
 *   /api/businesses:
 *     get:
 *       summary: Get all businesses
 *       tags: [Businesses]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 10
 *         - in: query
 *           name: isVerified
 *           schema:
 *             type: boolean
 *         - in: query
 *           name: searchTerm
 *           schema:
 *             type: string
 *         - in: query
 *           name: hasBranches
 *           schema:
 *             type: boolean
 *       responses:
 *         200:
 *           description: List of businesses
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   businesses:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Business'
 *                   pagination:
 *                     $ref: '#/components/schemas/PaginationResponse'
 *
 *   /api/businesses/{businessId}:
 *     get:
 *       summary: Get business details
 *       tags: [Businesses]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: businessId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         200:
 *           description: Business details
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Business'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 *
 *     patch:
 *       summary: Update business profile
 *       tags: [Businesses]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: businessId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_name:
 *                   type: string
 *                 legal_name:
 *                   type: string
 *                 tax_number:
 *                   type: string
 *                 business_license:
 *                   type: string
 *                 business_type:
 *                   type: string
 *                 registration_number:
 *                   type: string
 *                 verification_documents:
 *                   type: string
 *                 logo:
 *                   type: string
 *                 website:
 *                   type: string
 *                 working_hours:
 *                   type: string
 *       responses:
 *         200:
 *           description: Business profile updated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Business'
 *         400:
 *           $ref: '#/components/responses/ValidationError'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 *
 *   /api/businesses/{businessId}/locations:
 *     post:
 *       summary: Add business location
 *       tags: [Business Locations]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: businessId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - address
 *                 - latitude
 *                 - longitude
 *                 - city
 *                 - district
 *                 - postal_code
 *                 - phone
 *                 - working_hours
 *               properties:
 *                 address:
 *                   type: string
 *                 latitude:
 *                   type: number
 *                   format: float
 *                 longitude:
 *                   type: number
 *                   format: float
 *                 city:
 *                   type: string
 *                 district:
 *                   type: string
 *                 postal_code:
 *                   type: string
 *                 is_main_location:
 *                   type: boolean
 *                   default: false
 *                 phone:
 *                   type: string
 *                 working_hours:
 *                   type: string
 *                 create_branch:
 *                   type: boolean
 *                   default: false
 *                 branch_data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     branch_code:
 *                       type: string
 *                     description:
 *                       type: string
 *                     manager_name:
 *                       type: string
 *                     manager_email:
 *                       type: string
 *                     manager_phone:
 *                       type: string
 *                     operating_hours:
 *                       type: object
 *                     services:
 *                       type: array
 *                       items:
 *                         type: string
 *                     policies:
 *                       type: object
 *       responses:
 *         201:
 *           description: Location created
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   location:
 *                     $ref: '#/components/schemas/BusinessLocation'
 *                   branch:
 *                     $ref: '#/components/schemas/Branch'
 *         400:
 *           $ref: '#/components/responses/ValidationError'
 *
 *     get:
 *       summary: Get business locations
 *       tags: [Business Locations]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: businessId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         200:
 *           description: List of locations
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   allOf:
 *                     - $ref: '#/components/schemas/BusinessLocation'
 *                     - type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                           properties:
 *                             active_listings:
 *                               type: integer
 *                             has_active_branch:
 *                               type: boolean
 *                             branch_details:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 code:
 *                                   type: string
 *                                 active_listings:
 *                                   type: integer
 *                                 average_rating:
 *                                   type: number
 *                                   format: float
 *
 *   /api/businesses/{businessId}/stats:
 *     get:
 *       summary: Get business statistics
 *       tags: [Businesses]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: businessId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         200:
 *           description: Business statistics
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/BusinessStats'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 */
