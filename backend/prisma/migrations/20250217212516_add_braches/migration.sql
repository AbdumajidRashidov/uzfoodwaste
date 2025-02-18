/*
  Warnings:

  - Added the required column `branch_id` to the `BusinessLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_id` to the `FoodListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BusinessLocation" ADD COLUMN     "branch_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FoodListing" ADD COLUMN     "branch_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "manager_id" TEXT,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchStaff" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Branch_business_id_idx" ON "Branch"("business_id");

-- CreateIndex
CREATE INDEX "Branch_manager_id_idx" ON "Branch"("manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_business_id_name_key" ON "Branch"("business_id", "name");

-- CreateIndex
CREATE INDEX "BranchStaff_branch_id_idx" ON "BranchStaff"("branch_id");

-- CreateIndex
CREATE INDEX "BranchStaff_user_id_idx" ON "BranchStaff"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "BranchStaff_branch_id_user_id_key" ON "BranchStaff"("branch_id", "user_id");

-- CreateIndex
CREATE INDEX "BusinessLocation_business_id_idx" ON "BusinessLocation"("business_id");

-- CreateIndex
CREATE INDEX "BusinessLocation_branch_id_idx" ON "BusinessLocation"("branch_id");

-- CreateIndex
CREATE INDEX "FoodListing_branch_id_idx" ON "FoodListing"("branch_id");

-- AddForeignKey
ALTER TABLE "BusinessLocation" ADD CONSTRAINT "BusinessLocation_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodListing" ADD CONSTRAINT "FoodListing_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStaff" ADD CONSTRAINT "BranchStaff_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStaff" ADD CONSTRAINT "BranchStaff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
