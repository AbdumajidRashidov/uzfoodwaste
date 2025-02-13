// src/services/localization.service.ts
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

interface Translation {
  [key: string]: string | { [key: string]: string };
}

interface LocaleMessages {
  [locale: string]: Translation;
}

export class LocalizationService {
  private static instance: LocalizationService;
  private messages: LocaleMessages = {};
  private defaultLocale: string = "en";
  private supportedLocales: string[] = ["en", "uz", "ru"];

  private constructor() {
    this.loadTranslations();
  }

  static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  private loadTranslations(): void {
    this.supportedLocales.forEach((locale) => {
      try {
        const filePath = path.join(__dirname, `../locales/${locale}.json`);
        const fileContent = readFileSync(filePath, "utf8");
        this.messages[locale] = JSON.parse(fileContent);
      } catch (error) {
        console.error(`Failed to load translations for ${locale}:`, error);
        // Load empty translations if file is missing
        this.messages[locale] = {};
      }
    });
  }

  translate(
    key: string,
    locale: string = this.defaultLocale,
    params?: Record<string, string>
  ): string {
    const localeMessages =
      this.messages[locale] || this.messages[this.defaultLocale];
    let message = this.getNestedValue(localeMessages, key) || key;

    if (params) {
      message = this.interpolateParams(message, params);
    }

    return message;
  }

  private getNestedValue(obj: any, path: string): string | undefined {
    return path
      .split(".")
      .reduce(
        (current, key) =>
          current && typeof current === "object" ? current[key] : undefined,
        obj
      ) as string | undefined;
  }

  private interpolateParams(
    message: string,
    params: Record<string, string>
  ): string {
    return message.replace(/{(\w+)}/g, (_, key) => params[key] || `{${key}}`);
  }

  async getUserLocale(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { language_preference: true },
    });

    return user?.language_preference || this.defaultLocale;
  }

  async updateUserLocale(userId: string, locale: string): Promise<void> {
    if (!this.supportedLocales.includes(locale)) {
      throw new AppError(`Unsupported locale: ${locale}`, 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { language_preference: locale },
    });
  }

  getSupportedLocales(): string[] {
    return this.supportedLocales;
  }
}
