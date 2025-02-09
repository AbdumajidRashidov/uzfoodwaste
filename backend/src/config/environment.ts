// src/config/environment.ts
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  nodeEnv: process.env.NODE_ENV || "development",
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
    port: parseInt(process.env.EMAIL_PORT || "578"),
    secure: process.env.EMAIL_PORT === "465",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
  clientUrl: process.env.CLIENT_URL,
};
