// src/docs/map-search.doc.ts

/**
 * @swagger
 * tags:
 *   name: Map Search
 *   description: Map-based search operations
 */

/**
 * @swagger
 * /api/map-search/listings:
 *   get:
 *     summary: Search for food listings within a specific area on the map
 *     tags: [Map Search]
 *     description: Returns food listings based on location and other filtering criteria
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the center point for search
 *         example: 41.3092
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the center point for search
 *         example: 69.2401
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0.1
 *           maximum: 50
 *           default: 5
 *         description: Search radius in kilometers (default 5 km, max 50 km)
 *         example: 3.5
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
 *         description: Number of results per page
 *       - in: query
 *         name: minPrice
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Minimum price filter for food listings
 *         example: 5000
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Maximum price filter for food listings
 *         example: 50000
 *       - in: query
 *         name: categories
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of category IDs to filter by
 *         example: "cat1,cat2,cat3"
 *       - in: query
 *         name: isHalal
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by halal status
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term for finding food listings by title or description
 *         example: "bread"
 *       - in: query
 *         name: prioritizeUrgent
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to prioritize listings that are expiring soon
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
 *                   example: success
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
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           original_price:
 *                             type: number
 *                           distance:
 *                             type: number
 *                             description: Distance from the search location in kilometers
 *                           remaining_pickup_hours:
 *                             type: number
 *                           pickup_status:
 *                             type: string
 *                             enum: [normal, warning, urgent, expired]
 *                           business:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               company_name:
 *                                 type: string
 *                           location:
 *                             type: object
 *                             properties:
 *                               address:
 *                                 type: string
 *                               latitude:
 *                                 type: number
 *                               longitude:
 *                                 type: number
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
 *       400:
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/map-search/businesses:
 *   get:
 *     summary: Find businesses within a specific area on the map
 *     tags: [Map Search]
 *     description: Returns businesses based on location
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the center point for search
 *         example: 41.3092
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the center point for search
 *         example: 69.2401
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0.1
 *           maximum: 50
 *           default: 5
 *         description: Search radius in kilometers (default 5 km, max 50 km)
 *         example: 3.5
 *       - in: query
 *         name: isVerified
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by business verification status
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
 *         description: Number of results per page
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
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     businesses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           company_name:
 *                             type: string
 *                           is_verified:
 *                             type: boolean
 *                           distance:
 *                             type: number
 *                             description: Distance from the search location in kilometers
 *                           closest_location:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               latitude:
 *                                 type: number
 *                               longitude:
 *                                 type: number
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
 *       400:
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
