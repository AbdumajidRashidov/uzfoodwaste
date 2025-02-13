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

// CORS configuration
const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Allow localhost and ngrok URLs
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:4000",
    ];

    // Check if the origin is an ngrok URL
    if (origin.includes("ngrok.io") || origin.includes("ngrok-free.app")) {
      return callback(null, true);
    }

    // Check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Mount all routes
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
