-- AlterTable
ALTER TABLE "FoodListing" ADD COLUMN     "branch_id" TEXT;

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch_code" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "opening_date" TIMESTAMP(3) NOT NULL,
    "manager_name" TEXT NOT NULL,
    "manager_email" TEXT NOT NULL,
    "manager_phone" TEXT NOT NULL,
    "operating_hours" JSONB NOT NULL,
    "services" TEXT[],
    "policies" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchReview" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_location_id_key" ON "Branch"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_branch_code_key" ON "Branch"("branch_code");

-- CreateIndex
CREATE INDEX "Branch_business_id_idx" ON "Branch"("business_id");

-- CreateIndex
CREATE INDEX "Branch_branch_code_idx" ON "Branch"("branch_code");

-- CreateIndex
CREATE INDEX "Branch_status_idx" ON "Branch"("status");

-- CreateIndex
CREATE INDEX "BranchReview_branch_id_idx" ON "BranchReview"("branch_id");

-- CreateIndex
CREATE INDEX "BranchReview_customer_id_idx" ON "BranchReview"("customer_id");

-- CreateIndex
CREATE INDEX "FoodListing_branch_id_idx" ON "FoodListing"("branch_id");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "BusinessLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchReview" ADD CONSTRAINT "BranchReview_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchReview" ADD CONSTRAINT "BranchReview_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodListing" ADD CONSTRAINT "FoodListing_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
