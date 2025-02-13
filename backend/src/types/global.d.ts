// src/types/global.d.ts
export {};

declare global {
  namespace Express {
    interface Request {
      locale?: string;
      user?: any; // Add your user type here if needed
    }
  }
}
