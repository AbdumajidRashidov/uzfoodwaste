// src/routes/map-search.routes.ts
import { Router } from "express";
import { MapSearchController } from "../controllers/map-search.controller";

const router = Router();
const mapSearchController = new MapSearchController();

/**
 * @route GET /api/map-search/listings
 * @desc Search for food listings within a specified area on the map
 * @access Public
 */
router.get(
  "/listings",
  MapSearchController.mapSearchValidation,
  mapSearchController.searchListingsInArea
);

/**
 * @route GET /api/map-search/businesses
 * @desc Get businesses within a specified area on the map
 * @access Public
 */
router.get(
  "/businesses",
  MapSearchController.mapSearchValidation,
  mapSearchController.getNearbyBusinesses
);

export default router;
