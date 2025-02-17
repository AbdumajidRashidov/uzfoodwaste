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
import { BackgroundJobService } from "./services/background-job.service";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: config.cors.credentials,
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

const PORT = config.port;
const backgroundJobService = new BackgroundJobService();

const startServer = async () => {
  try {
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(
        `CORS allowed origins: ${config.cors.allowedOrigins.join(", ")}`
      );
      await backgroundJobService.startJobs();
    });

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      await backgroundJobService.stopJobs();
      process.exit(0);
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
