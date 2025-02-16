import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { config } from "../config/environment";

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Admin user data - you can modify these values
    const adminData = {
      email: config.admin.email || "",
      password: config.admin.password || "", // This will be hashed
      phone: config.admin.phone || "",
      firstName: config.admin.firstname || "",
      lastName: config.admin.lastname || "",
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Create admin user in a transaction
    const admin = await prisma.$transaction(async (prisma) => {
      // Create user with ADMIN role
      const user = await prisma.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          phone: adminData.phone,
          role: "ADMIN",
          is_verified: true, // Admins are verified by default
          language_preference: "en", // Default language
        },
      });

      // Create admin profile
      await prisma.customer.create({
        data: {
          user_id: user.id,
          first_name: adminData.firstName,
          last_name: adminData.lastName,
        },
      });

      return user;
    });

    console.log("Admin user created successfully!");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
    console.log("User ID:", admin.id);

    return admin;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  createAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default createAdmin;
