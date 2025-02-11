// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { config } from "./config/environment";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import businessRoutes from "./routes/business.routes";
import customerRoutes from "./routes/customer.routes";
import foodListingRoutes from "./routes/food-listing.routes";
import categoryRoutes from "./routes/category.routes";
import reservationRoutes from "./routes/reservation.routes";
import reviewRoutes from "./routes/review.routes";
import savedListingRoutes from "./routes/saved-listing.routes";
import listingCategoryRoutes from "./routes/listing-category.routes";
import notificationRoutes from "./routes/notification.routes";
import deviceRoutes from "./routes/device.routes";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Replace with allowed domains in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/food-listings", foodListingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/saved-listings", savedListingRoutes);
app.use("/api/listing-categories", listingCategoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/devices", deviceRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
