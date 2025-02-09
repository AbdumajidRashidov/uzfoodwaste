// src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";

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
        url: "http://localhost:3000",
        description: "Development server",
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
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              description: "User password",
            },
          },
        },
        CustomerRegister: {
          type: "object",
          required: [
            "email",
            "password",
            "phone",
            "role",
            "firstName",
            "lastName",
          ],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              description: "User password",
            },
            phone: {
              type: "string",
              description: "User phone number",
            },
            role: {
              type: "string",
              enum: ["CUSTOMER"],
              description: "User role - CUSTOMER",
            },
            firstName: {
              type: "string",
              description: "Customer first name",
            },
            lastName: {
              type: "string",
              description: "Customer last name",
            },
          },
        },
        BusinessRegister: {
          type: "object",
          required: [
            "email",
            "password",
            "phone",
            "role",
            "companyName",
            "legalName",
            "taxNumber",
          ],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              description: "User password",
            },
            phone: {
              type: "string",
              description: "User phone number",
            },
            role: {
              type: "string",
              enum: ["BUSINESS"],
              description: "User role - BUSINESS",
            },
            companyName: {
              type: "string",
              description: "Business company name",
            },
            legalName: {
              type: "string",
              description: "Business legal name",
            },
            taxNumber: {
              type: "string",
              description: "Business tax number",
            },
          },
        },
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
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
