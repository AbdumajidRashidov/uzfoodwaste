/*
  Warnings:

  - You are about to drop the `ReservationListing` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `listing_id` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReservationListing" DROP CONSTRAINT "ReservationListing_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "ReservationListing" DROP CONSTRAINT "ReservationListing_reservation_id_fkey";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "listing_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "ReservationListing";

-- CreateIndex
CREATE INDEX "Reservation_listing_id_idx" ON "Reservation"("listing_id");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "FoodListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
