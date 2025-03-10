// src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import { TunnelService } from "../services/tunnel.service";
import { config } from "./environment";

const getServerUrl = () => {
  const tunnelService = TunnelService.getInstance();
  const tunnelUrl = tunnelService.getUrl();
  if (config.nodeEnv == "production") {
    return config.cors.allowedOrigins[0];
  }
  return tunnelUrl || "http://localhost:3000";
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food Waste Reduction API",
      version: "1.0.0",
      description: "API documentation for Food Waste Reduction platform",
    },
    servers: [
      {
        url: getServerUrl(),
        description:
          config.nodeEnv == "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error message description",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/docs/*.ts"],
};

export const specs = swaggerJsdoc(options);
