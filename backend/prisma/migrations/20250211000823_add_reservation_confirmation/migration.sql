-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "confirmation_code" TEXT,
ADD COLUMN     "pickup_confirmed_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PaymentTransaction_transaction_id_idx" ON "PaymentTransaction"("transaction_id");
