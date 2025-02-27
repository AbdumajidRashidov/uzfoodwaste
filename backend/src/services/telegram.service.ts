// src/services/telegram.service.ts
import { Telegraf } from "telegraf";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/environment";
import { AppError } from "../middlewares/error.middleware";
import crypto from "crypto";

const prisma = new PrismaClient();

export class TelegramService {
  private bot: Telegraf;
  private static instance: TelegramService;
  private botUsername: string | undefined;

  private constructor() {
    if (!config.telegram.botToken) {
      throw new Error("Telegram bot token is not configured");
    }

    this.bot = new Telegraf(config.telegram.botToken);
    this.setupBot();
  }

  private async setupBot() {
    try {
      // Get bot information including username
      const botInfo = await this.bot.telegram.getMe();
      this.botUsername = botInfo.username;
      console.log("Telegram bot initialized:", this.botUsername);

      // Handle /start command
      this.bot.command("start", async (ctx) => {
        const params = ctx.message.text.split(" ");
        const verificationToken = params[1];

        if (!verificationToken) {
          ctx.reply(
            "Iltimos, ilovada keltirilgan havoladan foydalanib botni ishga tushiring."
          );
          return;
        }

        try {
          const verification = await prisma.telegramVerification.findUnique({
            where: { token: verificationToken },
            include: { user: true },
          });

          if (!verification || verification.status !== "PENDING") {
            ctx.reply("Tasdiqlash havolasi yaroqsiz yoki muddati o‘tgan.");
            return;
          }

          await ctx.reply(
            "Hisobingizni tasdiqlash uchun telefon raqamingizni ulashing.",
            {
              reply_markup: {
                keyboard: [
                  [
                    {
                      text: "Telefon raqamingizni ulashing",
                      request_contact: true,
                    },
                  ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );

          // Convert chat.id to BigInt
          const chatId = BigInt(ctx.chat.id);

          await prisma.telegramVerification.update({
            where: { id: verification.id },
            data: { telegram_chat_id: chatId },
          });
        } catch (error) {
          console.error("Telegram verification error:", error);
          ctx.reply(
            "Tekshirish paytida xatolik yuz berdi. Iltimos, qayta urinib koʻring."
          );
        }
      });

      // Handle phone number sharing
      this.bot.on("contact", async (ctx) => {
        const contact = ctx.message.contact;

        if (!contact || !contact.phone_number) {
          ctx.reply("Yaroqsiz telefon raqami qabul qilindi.");
          return;
        }

        try {
          // Convert chat.id to BigInt
          const chatId = BigInt(ctx.chat.id);

          const verification = await prisma.telegramVerification.findFirst({
            where: {
              telegram_chat_id: chatId,
              status: "PENDING",
            },
            include: { user: true },
          });

          if (!verification) {
            ctx.reply("Kutilayotgan verifikatsiya topilmadi.");
            return;
          }

          const phoneNumber = this.formatPhoneNumber(contact.phone_number);

          await prisma.$transaction([
            prisma.user.update({
              where: { id: verification.user_id },
              data: {
                phone: phoneNumber,
                phone_verified: true,
                is_verified: true,
              },
            }),
            prisma.telegramVerification.update({
              where: { id: verification.id },
              data: {
                status: "COMPLETED",
                verified_at: new Date(),
                verified_phone: phoneNumber,
              },
            }),
          ]);

          await ctx.reply(
            "Telefon raqami tasdiqlandi! Endi siz ushbu chatni yopishingiz va ilovaga qaytishingiz mumkin."
          );
        } catch (error) {
          console.error("Phone verification error:", error);
          ctx.reply(
            "Tekshirish paytida xatolik yuz berdi. Iltimos, qayta urinib koʻring."
          );
        }
      });

      // Launch bot with polling
      await this.bot.launch();
      console.log("Telegram bot started successfully");

      // Enable graceful stop
      process.once("SIGINT", () => this.bot.stop("SIGINT"));
      process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
    } catch (error) {
      console.error("Failed to initialize Telegram bot:", error);
      throw error;
    }
  }

  static async getInstance(): Promise<TelegramService> {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
      // Wait for bot setup to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return TelegramService.instance;
  }

  async startVerification(userId: string): Promise<string> {
    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    // Create verification record
    await prisma.telegramVerification.create({
      data: {
        user_id: userId,
        token,
        status: "PENDING",
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      },
    });

    if (!this.botUsername) {
      throw new AppError("Telegram bot not properly initialized", 500);
    }

    // Return bot link with verification token
    return `https://t.me/${this.botUsername}?start=${token}`;
  }

  async getVerificationStatus(userId: string): Promise<{
    status: string;
    verified_phone?: string;
  }> {
    const verification = await prisma.telegramVerification.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    if (!verification) {
      throw new AppError("No verification found", 404);
    }

    return {
      status: verification.status,
      verified_phone: verification.verified_phone || "",
    };
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  }
}
