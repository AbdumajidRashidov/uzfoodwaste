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
// import customerRoutes from "./routes/customer.routes";
// import foodListingRoutes from "./routes/food-listing.routes";
// import reservationRoutes from "./routes/reservation.routes";

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
// app.use("/api/customer", customerRoutes);
// app.use("/api/food-listing", foodListingRoutes);
// app.use("/api/reservation", reservationRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
