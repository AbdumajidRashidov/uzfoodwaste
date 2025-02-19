// src/docs/banner.doc.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Banner:
 *       type: object
 *       required:
 *         - title
 *         - image
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the banner
 *         title:
 *           type: string
 *           description: Main title of the banner
 *         title1:
 *           type: string
 *           description: Additional title line 1
 *         title2:
 *           type: string
 *           description: Additional title line 2
 *         image:
 *           type: string
 *           description: URL of the banner image
 *         btnText:
 *           type: string
 *           description: Text to display on the banner button
 *         description1:
 *           type: string
 *           description: First description line
 *         description2:
 *           type: string
 *           description: Second description line
 *         isActive:
 *           type: boolean
 *           description: Whether the banner is currently active
 *           default: true
 *         order:
 *           type: integer
 *           description: Display order of the banner
 *           default: 0
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         title: "Summer Sale"
 *         title1: "Big Savings"
 *         title2: "Limited Time"
 *         image: "https://example.com/banner.jpg"
 *         btnText: "Shop Now"
 *         description1: "Up to 50% off"
 *         description2: "Free shipping on all orders"
 *         isActive: true
 *         order: 1
 *         created_at: "2025-01-01T00:00:00.000Z"
 *         updated_at: "2025-01-01T00:00:00.000Z"
 *
 *     BannerCreate:
 *       type: object
 *       required:
 *         - title
 *         - image
 *       properties:
 *         title:
 *           type: string
 *         title1:
 *           type: string
 *         title2:
 *           type: string
 *         image:
 *           type: string
 *         btnText:
 *           type: string
 *         description1:
 *           type: string
 *         description2:
 *           type: string
 *         isActive:
 *           type: boolean
 *         order:
 *           type: integer
 *
 *     BannerUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         title1:
 *           type: string
 *         title2:
 *           type: string
 *         image:
 *           type: string
 *         btnText:
 *           type: string
 *         description1:
 *           type: string
 *         description2:
 *           type: string
 *         isActive:
 *           type: boolean
 *         order:
 *           type: integer
 *
 *     BannerOrderUpdate:
 *       type: array
 *       items:
 *         type: object
 *         required:
 *           - id
 *           - order
 *         properties:
 *           id:
 *             type: string
 *           order:
 *             type: integer
 *
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Create a new banner
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BannerCreate'
 *     responses:
 *       201:
 *         description: Banner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *
 *   get:
 *     summary: Get all banners
 *     tags: [Banners]
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
 *         description: Number of items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of banners
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
 *                     banners:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Banner'
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
 *         description: Forbidden - Admin access required
 *
 * /api/banners/{bannerId}:
 *   get:
 *     summary: Get a banner by ID
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the banner
 *     responses:
 *       200:
 *         description: Banner details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *
 *   patch:
 *     summary: Update a banner
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the banner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BannerUpdate'
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *
 *   delete:
 *     summary: Delete a banner
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the banner
 *     responses:
 *       204:
 *         description: Banner deleted successfully
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *
 * /api/banners/order/bulk:
 *   patch:
 *     summary: Update order of multiple banners
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BannerOrderUpdate'
 *     responses:
 *       200:
 *         description: Banner orders updated successfully
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
 *                   example: Banner order updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
