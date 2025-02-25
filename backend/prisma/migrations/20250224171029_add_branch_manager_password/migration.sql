/*
  Warnings:

  - Added the required column `manager_password` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "manager_password" TEXT NOT NULL;
