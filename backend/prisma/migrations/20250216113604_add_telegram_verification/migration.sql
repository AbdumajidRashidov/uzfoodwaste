-- CreateTable
CREATE TABLE "TelegramVerification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "telegram_chat_id" INTEGER,
    "verified_phone" TEXT,
    "verified_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramVerification_token_key" ON "TelegramVerification"("token");

-- CreateIndex
CREATE INDEX "TelegramVerification_user_id_idx" ON "TelegramVerification"("user_id");

-- CreateIndex
CREATE INDEX "TelegramVerification_token_idx" ON "TelegramVerification"("token");

-- CreateIndex
CREATE INDEX "TelegramVerification_telegram_chat_id_idx" ON "TelegramVerification"("telegram_chat_id");

-- AddForeignKey
ALTER TABLE "TelegramVerification" ADD CONSTRAINT "TelegramVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
