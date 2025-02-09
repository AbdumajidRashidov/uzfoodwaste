// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google
 *     description: |
 *       Authenticate using a Google ID token. To test this endpoint:
 *
 *       1. Go to https://developers.google.com/oauthplayground/
 *       2. On the right side, click "Sign In with Google"
 *       3. Select "Google OAuth2 API v2"
 *       4. Select these scopes:
 *          - email
 *          - profile
 *       5. Click "Authorize APIs"
 *       6. Click "Exchange authorization code for tokens"
 *       7. Copy the ID token
 *       8. Use that token in this endpoint
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token obtained from Google Sign-In
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZDY4NWY1ZTJlODJlY2...
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         is_verified:
 *                           type: boolean
 *       400:
 *         description: Missing or invalid token
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
 *                   example: Google token is required
 *       401:
 *         description: Invalid Google token
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
 *                   example: Invalid Google token
 */
router.post("/google", authController.googleAuth);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (customer or business)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - phone
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *               phone:
 *                 type: string
 *                 description: User phone number
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, BUSINESS]
 *                 description: User role
 *               firstName:
 *                 type: string
 *                 description: Required for CUSTOMER role
 *               lastName:
 *                 type: string
 *                 description: Required for CUSTOMER role
 *               companyName:
 *                 type: string
 *                 description: Required for BUSINESS role
 *               legalName:
 *                 type: string
 *                 description: Required for BUSINESS role
 *               taxNumber:
 *                 type: string
 *                 description: Required for BUSINESS role
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                     token:
 *                       type: string
 *                       description: JWT token
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 */
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("role")
      .isIn(["CUSTOMER", "BUSINESS"])
      .withMessage("Role must be either CUSTOMER or BUSINESS"),
  ],
  validate,
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     token:
 *                       type: string
 *                       description: JWT token
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         is_verified:
 *                           type: boolean
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

export default router;
