/*
  Warnings:

  - You are about to drop the column `listing_id` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_listing_id_fkey";

-- DropIndex
DROP INDEX "Reservation_listing_id_idx";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "listing_id";

-- CreateTable
CREATE TABLE "ReservationListing" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationListing_reservation_id_idx" ON "ReservationListing"("reservation_id");

-- CreateIndex
CREATE INDEX "ReservationListing_listing_id_idx" ON "ReservationListing"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationListing_reservation_id_listing_id_key" ON "ReservationListing"("reservation_id", "listing_id");

-- AddForeignKey
ALTER TABLE "ReservationListing" ADD CONSTRAINT "ReservationListing_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationListing" ADD CONSTRAINT "ReservationListing_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "FoodListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
