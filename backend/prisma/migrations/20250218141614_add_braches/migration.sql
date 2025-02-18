/*
  Warnings:

  - You are about to drop the column `created_at` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `BusinessLocation` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `FoodListing` table. All the data in the column will be lost.
  - You are about to drop the `Branch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BranchStaff` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_business_id_fkey";

-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "BranchStaff" DROP CONSTRAINT "BranchStaff_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "BranchStaff" DROP CONSTRAINT "BranchStaff_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BusinessLocation" DROP CONSTRAINT "BusinessLocation_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "FoodListing" DROP CONSTRAINT "FoodListing_branch_id_fkey";

-- DropIndex
DROP INDEX "BusinessLocation_branch_id_idx";

-- DropIndex
DROP INDEX "BusinessLocation_business_id_idx";

-- DropIndex
DROP INDEX "FoodListing_branch_id_idx";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "BusinessLocation" DROP COLUMN "branch_id";

-- AlterTable
ALTER TABLE "FoodListing" DROP COLUMN "branch_id";

-- DropTable
DROP TABLE "Branch";

-- DropTable
DROP TABLE "BranchStaff";
