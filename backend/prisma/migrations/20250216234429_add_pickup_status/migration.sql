-- AlterTable
ALTER TABLE "FoodListing" ADD COLUMN     "pickup_status" TEXT NOT NULL DEFAULT 'normal';

-- CreateIndex
CREATE INDEX "FoodListing_pickup_status_idx" ON "FoodListing"("pickup_status");
