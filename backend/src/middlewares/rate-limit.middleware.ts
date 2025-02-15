// src/middlewares/rate-limit.middleware.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { config } from "../config/environment";
import { RedisReply } from "rate-limit-redis/dist/index";

// Create a Redis client with better error handling
const createRedisClient = () => {
  try {
    if (!config.redis?.url) {
      console.log("No Redis URL provided, using memory store");
      return null;
    }

    const client = new Redis(config.redis.url, {
      enableOfflineQueue: true,
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.log("Redis connection failed, falling back to memory store");
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    client.on("error", (err) => {
      console.warn("Redis error:", err);
    });

    client.on("connect", () => {
      console.log("Connected to Redis successfully");
    });

    return client;
  } catch (error) {
    console.warn("Failed to initialize Redis:", error);
    return null;
  }
};

// Initialize Redis client
const redisClient = createRedisClient();

// Create a rate limiter with fallback to memory store
const createLimiter = (options: {
  windowMs: number;
  max: number;
  message: any;
  prefix?: string;
}) => {
  const limiterConfig = {
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
  };

  // If Redis client is available and connected, use Redis store
  if (redisClient?.status === "ready") {
    return rateLimit({
      ...limiterConfig,
      store: new RedisStore({
        // Fixed the TypeScript error with proper typing
        sendCommand: async (
          command: string,
          ...args: string[]
        ): Promise<RedisReply> => {
          return Object(redisClient).call(command, ...args);
        },
        prefix: options.prefix || "rl:",
      }),
    });
  }

  // Fallback to memory store
  console.log(
    `Using memory store for rate limiting (${options.prefix || "default"})`
  );
  return rateLimit(limiterConfig);
};

// API rate limit
export const apiLimiter = createLimiter({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

// File upload rate limit
export const fileUploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    status: "error",
    message: "Too many file operations, please try again later.",
  },
  prefix: "file-upload-limit:",
});

// Multiple file upload rate limit
export const multipleFileUploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    status: "error",
    message: "Too many bulk upload requests, please try again later.",
  },
  prefix: "multi-upload-limit:",
});
