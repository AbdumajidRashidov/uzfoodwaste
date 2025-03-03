// src/scripts/migrate-reservations.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * This script:
 * 1. Adds reservation_number to existing reservations
 * 2. Updates ReservationItem status based on parent Reservation status
 * 3. Ensures all businesses have a company_code
 */
async function migrateData() {
  try {
    console.log("Starting migration...");

    // 1. Ensure all businesses have a company_code
    console.log("Updating business company codes...");
    const businesses = await prisma.business.findMany();

    let updatedBusinesses = 0;
    for (const business of businesses) {
      // Skip if already has a code
      if (business.company_code) continue;

      // Generate a code from the first 3 letters of company name + random number
      const namePrefix = business.company_name.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
      const companyCode = `${namePrefix}${randomNum}`;

      await prisma.business.update({
        where: { id: business.id },
        data: { company_code: companyCode },
      });

      console.log(`Updated business ${business.id} with code ${companyCode}`);
      updatedBusinesses++;
    }

    console.log(`Updated ${updatedBusinesses} businesses with company codes`);

    // 2. Add reservation numbers to existing reservations
    console.log("Updating reservation numbers...");
    const reservations = await prisma.reservation.findMany({
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    let updatedReservations = 0;
    for (const reservation of reservations) {
      // Skip if already has a number
      if (reservation.reservation_number) continue;

      // Find a business code to use
      let businessCode = "BIZ";

      // Try to get from reservation items
      if (reservation.reservation_items.length > 0) {
        for (const item of reservation.reservation_items) {
          if (item.listing?.business?.company_code) {
            businessCode = item.listing.business.company_code;
            break;
          }
        }
      }

      // Format the date part
      const createdAt = reservation.created_at;
      const datePrefix = `${createdAt.getFullYear()}${String(
        createdAt.getMonth() + 1
      ).padStart(2, "0")}${String(createdAt.getDate()).padStart(2, "0")}`;

      // Generate a sequential number (simplified for migration)
      const sequence = Math.floor(1000 + Math.random() * 9000); // Just use a random number for migration
      const reservationNumber = `${businessCode}-${datePrefix}-${sequence
        .toString()
        .padStart(5, "0")}`;

      // Update the reservation
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { reservation_number: reservationNumber },
      });

      console.log(
        `Updated reservation ${reservation.id} with number ${reservationNumber}`
      );
      updatedReservations++;
    }

    console.log(`Updated ${updatedReservations} reservations with numbers`);

    // 3. Update ReservationItem status based on Reservation status
    console.log("Updating reservation item statuses...");
    const allReservations = await prisma.reservation.findMany({
      include: {
        reservation_items: true,
      },
    });

    let updatedItems = 0;
    for (const reservation of allReservations) {
      const status = reservation.status;

      // Update all items to match the reservation status but only if they don't already have a status
      for (const item of reservation.reservation_items) {
        if (!item.status || item.status === "") {
          await prisma.reservationItem.update({
            where: { id: item.id },
            data: { status },
          });
          updatedItems++;
        }
      }
    }

    console.log(`Updated ${updatedItems} reservation items with status`);
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
