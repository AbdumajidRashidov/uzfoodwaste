// src/docs/branch-manager.doc.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     BranchManagerProfile:
 *       type: object
 *       properties:
 *         personal_info:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             email:
 *               type: string
 *               format: email
 *             phone:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *         branch_info:
 *           $ref: '#/components/schemas/Branch'
 *
 *     BranchSettings:
 *       type: object
 *       properties:
 *         operating_hours:
 *           type: object
 *           properties:
 *             monday:
 *               type: object
 *               properties:
 *                 open:
 *                   type: string
 *                   example: "09:00"
 *                 close:
 *                   type: string
 *                   example: "18:00"
 *         services:
 *           type: array
 *           items:
 *             type: string
 *           example: ["dine-in", "takeaway"]
 *         policies:
 *           type: object
 *           additionalProperties: true
 *
 *     BranchManagerStats:
 *       type: object
 *       properties:
 *         active_listings:
 *           type: integer
 *         total_reservations:
 *           type: integer
 *         completed_reservations:
 *           type: integer
 *         average_rating:
 *           type: number
 *           format: float
 *         total_reviews:
 *           type: integer
 *
 * /api/branch-managers/profile:
 *   get:
 *     tags: [Branch Managers]
 *     summary: Get branch manager profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/BranchManagerProfile'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *
 *   patch:
 *     tags: [Branch Managers]
 *     summary: Update branch manager profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/BranchManagerProfile'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *
 * /api/branch-managers/stats:
 *   get:
 *     tags: [Branch Managers]
 *     summary: Get branch statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/BranchManagerStats'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *
 * /api/branch-managers/settings:
 *   patch:
 *     tags: [Branch Managers]
 *     summary: Update branch settings
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchSettings'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/BranchManagerProfile'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *
 * /api/branch-managers:
 *   get:
 *     tags: [Branch Managers]
 *     summary: List all branch managers (Admin/Business only)
 *     security:
 *       - BearerAuth: []
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
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
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
 *         description: Success
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BranchManagerProfile'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *
 * /api/branch-managers/{managerId}/reset-password:
 *   post:
 *     tags: [Branch Managers]
 *     summary: Reset manager's password (Admin/Business only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password reset successful. New password sent to manager's email.
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *
 * /api/branch-managers/{managerId}/status:
 *   patch:
 *     tags: [Branch Managers]
 *     summary: Update manager's status (Admin/Business only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/BranchManagerProfile'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
