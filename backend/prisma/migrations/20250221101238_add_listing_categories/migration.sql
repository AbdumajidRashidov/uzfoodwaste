/*
  Warnings:

  - You are about to drop the `_CategoryToFoodListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToFoodListing" DROP CONSTRAINT "_CategoryToFoodListing_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToFoodListing" DROP CONSTRAINT "_CategoryToFoodListing_B_fkey";

-- DropTable
DROP TABLE "_CategoryToFoodListing";

-- CreateTable
CREATE TABLE "ListingCategory" (
    "listing_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "ListingCategory_pkey" PRIMARY KEY ("listing_id","category_id")
);

-- CreateIndex
CREATE INDEX "ListingCategory_listing_id_idx" ON "ListingCategory"("listing_id");

-- CreateIndex
CREATE INDEX "ListingCategory_category_id_idx" ON "ListingCategory"("category_id");

-- AddForeignKey
ALTER TABLE "ListingCategory" ADD CONSTRAINT "ListingCategory_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "FoodListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingCategory" ADD CONSTRAINT "ListingCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
