/*
  Warnings:

  - You are about to drop the column `foodListingId` on the `Reservation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_code]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reservation_number]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_foodListingId_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "company_code" TEXT;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "foodListingId",
ADD COLUMN     "food_listing_id" TEXT,
ADD COLUMN     "reservation_number" TEXT,
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ReservationItem" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Business_company_code_key" ON "Business"("company_code");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservation_number_key" ON "Reservation"("reservation_number");

-- CreateIndex
CREATE INDEX "Reservation_reservation_number_idx" ON "Reservation"("reservation_number");

-- CreateIndex
CREATE INDEX "ReservationItem_status_idx" ON "ReservationItem"("status");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_food_listing_id_fkey" FOREIGN KEY ("food_listing_id") REFERENCES "FoodListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
