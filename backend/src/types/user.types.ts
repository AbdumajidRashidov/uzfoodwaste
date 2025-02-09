// src/types/user.types.ts
import { Request } from "express";

export interface UserData {
  id: string;
  email: string;
  is_verified: boolean;
  language_preference: string;
  role: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  business?: {
    id: string;
    company_name: string;
    is_verified: boolean;
  } | null;
}

export interface AuthRequest extends Request {
  user?: UserData;
}
