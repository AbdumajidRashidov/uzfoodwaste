// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { config } from "./config/environment";
import { errorHandler } from "./middlewares/error.middleware";
import indexRoutes from "./routes/index.routes";
import { TunnelService } from "./services/tunnel.service";

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

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Start tunnel if enabled
    if (config.ngrok?.enabled) {
      const tunnelService = TunnelService.getInstance();
      await tunnelService.start();

      // Handle graceful shutdown
      process.on("SIGTERM", async () => {
        await tunnelService.stop();
        process.exit(0);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
