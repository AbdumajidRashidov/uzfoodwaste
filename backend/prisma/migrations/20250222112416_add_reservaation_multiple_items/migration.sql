/*
  Warnings:

  - You are about to drop the column `listing_id` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `total_amount` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_listing_id_fkey";

-- DropIndex
DROP INDEX "Reservation_listing_id_idx";

-- DropIndex
DROP INDEX "Review_reservation_id_key";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "listing_id",
ADD COLUMN     "foodListingId" TEXT,
ADD COLUMN     "total_amount" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "pickup_time" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "listing_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ReservationItem" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ReservationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationItem_reservation_id_idx" ON "ReservationItem"("reservation_id");

-- CreateIndex
CREATE INDEX "ReservationItem_listing_id_idx" ON "ReservationItem"("listing_id");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_foodListingId_fkey" FOREIGN KEY ("foodListingId") REFERENCES "FoodListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "FoodListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "FoodListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
