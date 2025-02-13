// src/types/express/index.d.ts

declare namespace Express {
  export interface Request {
    locale?: string;
    user?: any; // Add your user type here if needed
  }
}
