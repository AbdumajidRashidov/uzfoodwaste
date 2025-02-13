// src/middlewares/localization.middleware.ts
import { Request, Response, NextFunction } from "express";
import { LocalizationService } from "../services/localization.service";

declare module "express-serve-static-core" {
  interface Request {
    locale?: string;
  }
}

export const localizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const localizationService = LocalizationService.getInstance();

  // Try to get locale from:
  // 1. Query parameter
  // 2. Accept-Language header
  // 3. Default locale
  let locale =
    (req.query.locale as string) ||
    req.headers["accept-language"]?.split(",")[0] ||
    "en";

  // Ensure locale is supported
  if (!localizationService.getSupportedLocales().includes(locale)) {
    locale = "en";
  }

  // Attach locale to request for use in controllers
  req.locale = locale;

  next();
};
