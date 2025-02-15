// src/middlewares/rate-limit.middleware.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { config } from "../config/environment";

// Redis client for rate limiting
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => Object(redisClient).call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests, please try again later.OK?",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for file operations
export const fileUploadLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => Object(redisClient).call(...args),
    prefix: "file-upload-limit:", // Separate prefix for file uploads
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 file operations per hour
  message: {
    status: "error",
    message: "Too many file operations, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific limit for multiple file uploads
export const multipleFileUploadLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => Object(redisClient).call(...args),
    prefix: "multi-upload-limit:",
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 multiple file uploads per hour
  message: {
    status: "error",
    message: "Too many bulk upload requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
