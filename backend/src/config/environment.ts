// src/config/environment.ts
import dotenv from "dotenv";
dotenv.config();

export interface Config {
  port: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  nodeEnv: string;
}

export const config: Config = {
  port: process.env.PORT || "3000",
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  nodeEnv: process.env.NODE_ENV || "development",
};
