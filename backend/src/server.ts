// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { config } from "./config/environment";
import { errorHandler } from "./middlewares/error.middleware";
import indexRoutes from "./routes/index.routes";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Replace with allowed domains in production
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Mount all routes from index.routes.ts
app.use("/", indexRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
