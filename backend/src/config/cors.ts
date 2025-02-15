// src/config/cors.ts
import cors from "cors";
import { config } from "./environment";

// CORS options configuration
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      const url = new URL(origin);

      // Validate URL scheme
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        callback(
          new Error('URL scheme must be "http" or "https" for CORS request.'),
          false
        );
        return;
      }

      // Check against allowed origins
      const allowedOrigins =
        config.cors.allowedOrigins || "".split(",").map((o) => o.trim());

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        config.nodeEnv === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    } catch (error) {
      callback(new Error("Invalid origin URL"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true, // Allow credentials (cookies, authorization headers, etc)
  maxAge: 86400, // Cache preflight requests for 24 hours
  exposedHeaders: ["Content-Disposition"], // Expose headers for file downloads
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
};

// Network error handler middleware
export const networkErrorHandler = (
  err: Error,
  req: any,
  res: any,
  next: any
) => {
  if (err.message === "Network Error" || err.message.includes("ECONNREFUSED")) {
    return res.status(503).json({
      status: "error",
      message:
        "Network connection failed. Please check your internet connection.",
      error: {
        code: "NETWORK_ERROR",
        details: err.message,
      },
    });
  }
  next(err);
};

// Custom CORS error handler
export const corsErrorHandler = (err: Error, req: any, res: any, next: any) => {
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      status: "error",
      message: "CORS error: Origin not allowed",
      error: {
        code: "CORS_ERROR",
        details: err.message,
      },
    });
  }
  next(err);
};
