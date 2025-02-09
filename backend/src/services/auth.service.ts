// src/services/auth.service.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { AppError } from "../middlewares/error.middleware";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret
);

const prisma = new PrismaClient();

export class AuthService {
  private generateToken(userId: string) {
    return jwt.sign(
      { id: userId },
      config.jwtSecret as jwt.Secret,
      {
        expiresIn: config.jwtExpiresIn,
      } as jwt.SignOptions
    );
  }

  async register(userData: {
    email: string;
    password: string;
    phone: string;
    role: "CUSTOMER" | "BUSINESS";
    firstName?: string;
    lastName?: string;
    companyName?: string;
    legalName?: string;
    taxNumber?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          phone: userData.phone,
          role: userData.role,
        },
      });

      // Create associated profile based on role
      if (
        userData.role === "CUSTOMER" &&
        userData.firstName &&
        userData.lastName
      ) {
        await prisma.customer.create({
          data: {
            user_id: user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        });
      } else if (
        userData.role === "BUSINESS" &&
        userData.companyName &&
        userData.legalName &&
        userData.taxNumber
      ) {
        await prisma.business.create({
          data: {
            user_id: user.id,
            company_name: userData.companyName,
            legal_name: userData.legalName,
            tax_number: userData.taxNumber,
            business_license: "", // Required fields that should be updated later
            business_type: "", // Required fields that should be updated later
            registration_number: "", // Required fields that should be updated later
            verification_documents: "", // Required fields that should be updated later
            working_hours: "", // Required fields that should be updated later
          },
        });
      }

      return user;
    });

    // Generate token
    const token = this.generateToken(result.id);

    return { token, user: result };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    };
  }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError("Invalid Google token", 401);
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        // Create new user
        const result = await prisma.$transaction(async (prisma) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: payload.email!,
              password: "", // Google auth doesn't need password
              phone: "", // Will need to be updated later
              role: "CUSTOMER", // Default role
              is_verified: true, // Google verified email
            },
          });

          // Create customer profile
          await prisma.customer.create({
            data: {
              user_id: user.id,
              first_name: payload.given_name || "",
              last_name: payload.family_name || "",
              profile_picture: payload.picture,
            },
          });

          return user;
        });

        user = result;
      }

      // Generate token
      const jwtToken = this.generateToken(user.id);

      return {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
        },
      };
    } catch (error) {
      throw new AppError("Invalid Google token", 401);
    }
  }
}
