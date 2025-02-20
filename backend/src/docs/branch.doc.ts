// src/docs/branch.doc.ts

/**
 * @swagger
 * paths:
 *   /api/branches:
 *     post:
 *       summary: Create a new branch
 *       tags: [Branches]
 *       security:
 *         - BearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - location_id
 *                 - name
 *                 - branch_code
 *                 - opening_date
 *                 - manager_name
 *                 - manager_email
 *                 - manager_phone
 *                 - operating_hours
 *                 - services
 *               properties:
 *                 location_id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 branch_code:
 *                   type: string
 *                 description:
 *                   type: string
 *                 opening_date:
 *                   type: string
 *                   format: date-time
 *                 manager_name:
 *                   type: string
 *                 manager_email:
 *                   type: string
 *                   format: email
 *                 manager_phone:
 *                   type: string
 *                 operating_hours:
 *                   type: object
 *                 services:
 *                   type: array
 *                   items:
 *                     type: string
 *                 policies:
 *                   type: object
 *       responses:
 *         201:
 *           description: Branch created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Branch'
 *         400:
 *           description: Invalid input or branch code already exists
 *         404:
 *           description: Business or location not found
 *
 *   /api/branches/{branchId}:
 *     get:
 *       summary: Get branch details
 *       tags: [Branches]
 *       parameters:
 *         - in: path
 *           name: branchId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         200:
 *           description: Branch details retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Branch'
 *                   - type: object
 *                     properties:
 *                       average_rating:
 *                         type: number
 *                         format: float
 *                       total_reviews:
 *                         type: integer
 *                       active_listings:
 *                         type: integer
 *         404:
 *           description: Branch not found
 *
 *     patch:
 *       summary: Update branch details
 *       tags: [Branches]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: branchId
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
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, INACTIVE]
 *                 manager_name:
 *                   type: string
 *                 manager_email:
 *                   type: string
 *                   format: email
 *                 manager_phone:
 *                   type: string
 *                 operating_hours:
 *                   type: object
 *                 services:
 *                   type: array
 *                   items:
 *                     type: string
 *                 policies:
 *                   type: object
 *       responses:
 *         200:
 *           description: Branch updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Branch'
 *         404:
 *           description: Branch not found
 *
 *   /api/branches/{branchId}/reviews:
 *     post:
 *       summary: Create a review for a branch
 *       tags: [Branch Reviews]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: branchId
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
 *                 - rating
 *                 - comment
 *               properties:
 *                 rating:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 5
 *                 comment:
 *                   type: string
 *       responses:
 *         201:
 *           description: Review created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/BranchReview'
 *         400:
 *           description: Invalid input or already reviewed
 *         404:
 *           description: Branch not found
 *
 *     get:
 *       summary: Get branch reviews
 *       tags: [Branch Reviews]
 *       parameters:
 *         - in: path
 *           name: branchId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
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
 *           name: rating
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 5
 *       responses:
 *         200:
 *           description: List of branch reviews
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   reviews:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/BranchReview'
 *                   pagination:
 *                     type: object
 *                     properties:
 *                       total:
 *                         type: integer
 *                       page:
 *                         type: integer
 *                       limit:
 *                         type: integer
 *                       total_pages:
 *                         type: integer
 *
 *   /api/branches/{branchId}/analytics:
 *     get:
 *       summary: Get branch analytics
 *       tags: [Branches]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: branchId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *         - in: query
 *           name: period
 *           schema:
 *             type: string
 *             enum: [week, month, year]
 *       responses:
 *         200:
 *           description: Branch analytics
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/BranchAnalytics'
 *         404:
 *           description: Branch not found
 *
 *   /api/businesses/{businessId}/branches:
 *     get:
 *       summary: Get all branches for a business
 *       tags: [Branches]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: businessId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
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
 *           name: status
 *           schema:
 *             type: string
 *             enum: [ACTIVE, INACTIVE]
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: List of branches with stats
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   branches:
 *                     type: array
 *                     items:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Branch'
 *                         - type: object
 *                           properties:
 *                             active_listings:
 *                               type: integer
 *                             average_rating:
 *                               type: number
 *                               format: float
 *                             total_reviews:
 *                               type: integer
 *                   pagination:
 *                     type: object
 *                     properties:
 *                       total:
 *                         type: integer
 *                       page:
 *                         type: integer
 *                       limit:
 *                         type: integer
 *                       total_pages:
 *                         type: integer
 *
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Branches
 *     description: Branch management endpoints
 *   - name: Branch Reviews
 *     description: Branch review management endpoints
 */

export {};
