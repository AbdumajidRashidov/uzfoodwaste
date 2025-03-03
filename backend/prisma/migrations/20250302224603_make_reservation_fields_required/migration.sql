/*
  Warnings:

  - Made the column `company_code` on table `Business` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reservation_number` on table `Reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "company_code" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "reservation_number" SET NOT NULL;
