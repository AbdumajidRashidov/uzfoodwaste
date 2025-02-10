// src/routes/business.routes.ts
import { Router } from "express";
import { BusinessController } from "../controllers/business.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const businessController = new BusinessController();

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
router.get("/:businessId", protect, businessController.getBusinessProfile);

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
router.patch(
  "/:businessId",
  protect,
  [
    body("company_name").optional().isString(),
    body("legal_name").optional().isString(),
    body("tax_number").optional().isString(),
    body("business_license").optional().isString(),
    body("business_type").optional().isString(),
    body("registration_number").optional().isString(),
    body("verification_documents").optional().isString(),
    body("logo").optional().isString(),
    body("website").optional().isURL().optional(),
    body("working_hours").optional().isString(),
  ],
  validate,
  businessController.updateBusinessProfile
);

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
router.post(
  "/:businessId/locations",
  protect,
  [
    body("address").isString().notEmpty(),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("city").isString().notEmpty(),
    body("district").isString().notEmpty(),
    body("postal_code").isString().notEmpty(),
    body("is_main_location").isBoolean().optional(),
    body("phone").isString().notEmpty(),
    body("working_hours").isString().notEmpty(),
  ],
  validate,
  businessController.addBusinessLocation
);

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
router.patch(
  "/:businessId/locations/:locationId",
  protect,
  [
    body("address").optional().isString(),
    body("latitude").optional().isFloat({ min: -90, max: 90 }),
    body("longitude").optional().isFloat({ min: -180, max: 180 }),
    body("city").optional().isString(),
    body("district").optional().isString(),
    body("postal_code").optional().isString(),
    body("is_main_location").optional().isBoolean(),
    body("phone").optional().isString(),
    body("working_hours").optional().isString(),
  ],
  validate,
  businessController.updateBusinessLocation
);

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
router.delete(
  "/:businessId/locations/:locationId",
  protect,
  businessController.deleteBusinessLocation
);

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
router.get(
  "/:businessId/locations",
  protect,
  businessController.getBusinessLocations
);

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
router.get("/:businessId/stats", protect, businessController.getBusinessStats);

export default router;
