// src/docs/listing-category.doc.ts
/**
 * @swagger
 * tags:
 *   name: Listing Categories
 *   description: Manage categories for food listings
 */

/**
 * @swagger
 * /api/listing-categories/{listingId}/categories:
 *   get:
 *     summary: Get categories for a food listing
 *     tags: [Listing Categories]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The food listing ID
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       listing_id:
 *                         type: string
 *                         format: uuid
 *                       category_id:
 *                         type: string
 *                         format: uuid
 *                       category:
 *                         $ref: '#/components/schemas/Category'
 *       404:
 *         description: Food listing not found
 *
 *   post:
 *     summary: Add categories to a food listing
 *     tags: [Listing Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The food listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_ids
 *             properties:
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of category IDs to add
 *     responses:
 *       200:
 *         description: Categories added successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Food listing or categories not found
 *
 *   delete:
 *     summary: Remove categories from a food listing
 *     tags: [Listing Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The food listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_ids
 *             properties:
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of category IDs to remove
 *     responses:
 *       200:
 *         description: Categories removed successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Food listing not found
 */
