// src/docs/branch.doc.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - name
 *         - branch_code
 *         - manager_name
 *         - manager_email
 *         - manager_phone
 *         - manager_password
 *         - operating_hours
 *         - services
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The branch ID
 *         business_id:
 *           type: string
 *           format: uuid
 *           description: The associated business ID
 *         location_id:
 *           type: string
 *           format: uuid
 *           description: The associated location ID
 *         name:
 *           type: string
 *           description: Branch name
 *         branch_code:
 *           type: string
 *           description: Unique branch code
 *         description:
 *           type: string
 *           description: Branch description
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: Branch status
 *         opening_date:
 *           type: string
 *           format: date-time
 *           description: Branch opening date
 *         manager_name:
 *           type: string
 *           description: Branch manager's name
 *         manager_email:
 *           type: string
 *           format: email
 *           description: Branch manager's email
 *         manager_phone:
 *           type: string
 *           description: Branch manager's phone number
 *         manager_password:
 *           type: string
 *           description: Branch manager's temporary password
 *         operating_hours:
 *           type: object
 *           description: Branch operating hours structure
 *         services:
 *           type: array
 *           items:
 *             type: string
 *           description: List of services offered
 *         policies:
 *           type: object
 *           description: Branch-specific policies
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     BranchReview:
 *       type: object
 *       required:
 *         - rating
 *         - comment
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         branch_id:
 *           type: string
 *           format: uuid
 *         customer_id:
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
 *
 *     BranchAnalytics:
 *       type: object
 *       properties:
 *         total_listings:
 *           type: integer
 *         active_listings:
 *           type: integer
 *         total_reservations:
 *           type: integer
 *         completed_reservations:
 *           type: integer
 *         completion_rate:
 *           type: number
 *           format: float
 *         average_rating:
 *           type: number
 *           format: float
 *         total_reviews:
 *           type: integer
 *         period:
 *           type: string
 *           enum: [week, month, year, all]
 *
 * paths:
 *   /api/branches:
 *     post:
 *       tags: [Branches]
 *       summary: Create a new branch
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
 *                 - manager_name
 *                 - manager_email
 *                 - manager_phone
 *                 - manager_password
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
 *                 manager_password:
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
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: success
 *                   data:
 *                     $ref: '#/components/schemas/Branch'
 *         400:
 *           $ref: '#/components/responses/BadRequest'
 *         401:
 *           $ref: '#/components/responses/Unauthorized'
 *         403:
 *           $ref: '#/components/responses/Forbidden'
 *
 *   /api/branches/{branchId}:
 *     get:
 *       tags: [Branches]
 *       summary: Get branch details
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
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: success
 *                   data:
 *                     $ref: '#/components/schemas/Branch'
 *         404:
 *           $ref: '#/components/responses/NotFound'
 *
 *     patch:
 *       tags: [Branches]
 *       summary: Update branch details
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
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: success
 *                   data:
 *                     $ref: '#/components/schemas/Branch'
 *         400:
 *           $ref: '#/components/responses/BadRequest'
 *         401:
 *           $ref: '#/components/responses/Unauthorized'
 *         403:
 *           $ref: '#/components/responses/Forbidden'
 *         404:
 *           $ref: '#/components/responses/NotFound'
 *
 *   /api/branches/business/branches:
 *     get:
 *       tags: [Branches]
 *       summary: Get all branches for a business
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             minimum: 1
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
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
 *           description: List of branches retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: success
 *                   data:
 *                     type: object
 *                     properties:
 *                       branches:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Branch'
 *                       pagination:
 *                         $ref: '#/components/schemas/Pagination'
 *         401:
 *           $ref: '#/components/responses/Unauthorized'
 *         403:
 *           $ref: '#/components/responses/Forbidden'
 *
 *   /api/branches/{branchId}/reviews:
 *     get:
 *       tags: [Branches]
 *       summary: Get branch reviews
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
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *         - in: query
 *           name: rating
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 5
 *       responses:
 *         200:
 *           description: Branch reviews retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: success
 *                   data:
 *                     type: object
 *                     properties:
 *                       reviews:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/BranchReview'
 *                       pagination:
 *                         $ref: '#/components/schemas/Pagination'
 *         404:
 *           $ref: '#/components/responses/NotFound'
 *
 *     post:
 *       tags: [Branches]
 *       summary: Create a branch review
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
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: success
 *                   data:
 *                     $ref: '#/components/schemas/BranchReview'
 *         400:
 *           $ref: '#/components/responses/BadRequest'
 *         401:
 *           $ref: '#/components/responses/Unauthorized'
 *         403:
 *           $ref: '#/components/responses/Forbidden'
 *         404:
 *           $ref: '#/components/responses/NotFound'
 *
 *   /api/branches/{branchId}/analytics:
 *     get:
 *       tags: [Branches]
 *       summary: Get branch analytics
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
 *           description: Branch analytics retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: success
 *                   data:
 *                     $ref: '#/components/schemas/BranchAnalytics'
 *         401:
 *           $ref: '#/components/responses/Unauthorized'
 *         403:
 *           $ref: '#/components/responses/Forbidden'
 *         404:
 *           $ref: '#/components/responses/NotFound'
 */
