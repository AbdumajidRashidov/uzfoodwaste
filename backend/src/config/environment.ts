// src/config/environment.ts
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || ("24h" as string | number),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:3000/api/auth/google/callback",
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || "578"),
    secure: process.env.EMAIL_PORT === "465",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
  },
  ngrok: {
    authToken: process.env.NGROK_AUTH_TOKEN,
    region: process.env.NGROK_REGION || "us",
    enabled: process.env.ENABLE_TUNNEL === "true",
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    clientEmail: process.env.GCP_CLIENT_EMAIL,
    privateKey: process.env.GCP_PRIVATE_KEY || "",
    bucketName: process.env.GCP_BUCKET_NAME,
  },
  cors: {
    allowedOrigins: (
      process.env.CORS_ALLOWED_ORIGINS ||
      "http://localhost:3000,http://localhost:5173"
    ).split(","),
    credentials: process.env.CORS_CREDENTIALS === "true",
  },
  redis: {
    host: process.env.REDISHOST || "localhost",
    port: Number(process.env.REDISPORT || "6379"),
    password: process.env.REDISPASSWORD,
    url: process.env.REDIS_URL || null,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    firstname: process.env.ADMIN_FIRSTNAME,
    lastname: process.env.ADMIN_LASTNAME,
    phone: process.env.ADMIN_PHONE,
  },
};
