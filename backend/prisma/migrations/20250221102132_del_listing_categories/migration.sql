/*
  Warnings:

  - You are about to drop the `ListingCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ListingCategory" DROP CONSTRAINT "ListingCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "ListingCategory" DROP CONSTRAINT "ListingCategory_listing_id_fkey";

-- DropTable
DROP TABLE "ListingCategory";

-- CreateTable
CREATE TABLE "_CategoryToFoodListing" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToFoodListing_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToFoodListing_B_index" ON "_CategoryToFoodListing"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToFoodListing" ADD CONSTRAINT "_CategoryToFoodListing_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToFoodListing" ADD CONSTRAINT "_CategoryToFoodListing_B_fkey" FOREIGN KEY ("B") REFERENCES "FoodListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
