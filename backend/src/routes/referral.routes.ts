// src/routes/referral.routes.ts
import { Router } from "express";
import { ReferralController } from "../controllers/referral.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body } from "express-validator";

const router = Router();
const referralController = new ReferralController();

// All routes require authentication
router.use(protect);

// Create a new referral code
router.post(
  "/code",
  [
    body("usage_limit").optional().isInt({ min: 1 }),
    body("reward_points").optional().isInt({ min: 1 }),
    body("expires_at").optional().isISO8601(),
  ],
  validate,
  referralController.createReferralCode
);

// Apply a referral code
router.post(
  "/apply",
  [body("code").isString().notEmpty().withMessage("Referral code is required")],
  validate,
  referralController.applyReferralCode
);

// Get user's referrals
router.get("/my-referrals", referralController.getUserReferrals);

// Get user's points
router.get("/points", referralController.getUserPoints);

export default router;
