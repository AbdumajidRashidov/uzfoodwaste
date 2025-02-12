// src/routes/index.routes.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import businessRoutes from "./business.routes";
import customerRoutes from "./customer.routes";
import foodListingRoutes from "./food-listing.routes";
import categoryRoutes from "./category.routes";
import reservationRoutes from "./reservation.routes";
import reviewRoutes from "./review.routes";
import savedListingRoutes from "./saved-listing.routes";
import listingCategoryRoutes from "./listing-category.routes";
import notificationRoutes from "./notification.routes";
import deviceRoutes from "./device.routes";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Version prefix for all routes
const API_VERSION = "/api";

// Mount all routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/businesses`, businessRoutes);
router.use(`${API_VERSION}/customers`, customerRoutes);
router.use(`${API_VERSION}/food-listings`, foodListingRoutes);
router.use(`${API_VERSION}/categories`, categoryRoutes);
router.use(`${API_VERSION}/reservations`, reservationRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);
router.use(`${API_VERSION}/saved-listings`, savedListingRoutes);
router.use(`${API_VERSION}/listing-categories`, listingCategoryRoutes);
router.use(`${API_VERSION}/notifications`, notificationRoutes);
router.use(`${API_VERSION}/devices`, deviceRoutes);

export default router;
