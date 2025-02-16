// src/utils/user.util.ts

interface User {
  id: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  is_verified: boolean;
  language_preference: string;
  password_reset_token: string | null; // Changed from undefined to null
  password_reset_expires: Date | null; // Changed from undefined to null
  phone_verified: boolean;
  [key: string]: any;
}

type SensitiveFields =
  | "password"
  | "password_reset_token"
  | "password_reset_expires";
const SENSITIVE_FIELDS: SensitiveFields[] = [
  "password",
  "password_reset_token",
  "password_reset_expires",
];

/**
 * Removes sensitive fields from a single user object
 */
const sanitizeUserObject = (user: User): User => {
  const sanitized = { ...user };
  SENSITIVE_FIELDS.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
};

/**
 * Removes sensitive fields from user data
 */
export const excludeSensitiveFields = <T extends User | User[]>(data: T): T => {
  if (Array.isArray(data)) {
    return data.map(sanitizeUserObject) as T;
  }
  return sanitizeUserObject(data) as T;
};

/**
 * Type guard to check if an object is a User
 */
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj === "object" && "id" in obj && "email" in obj;
};

/**
 * Generic type for objects that might contain user data
 */
export interface ApiResponse<T = any> {
  status: string;
  data: T;
}

/**
 * Sanitizes any data structure that might contain user information
 */
export const sanitizeResponse = <T>(data: T): T => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item)) as T;
  }

  if (typeof data === "object") {
    if (isUser(data)) {
      return sanitizeUserObject(data) as T;
    }

    const sanitized: Record<string, any> = {};
    Object.entries(data as Record<string, any>).forEach(([key, value]) => {
      sanitized[key] =
        value && typeof value === "object" ? sanitizeResponse(value) : value;
    });
    return sanitized as T;
  }

  return data;
};

/**
 * Sanitizes API responses
 */
export const sanitizeApiResponse = <T>(
  response: ApiResponse<T>
): ApiResponse<T> => {
  return {
    ...response,
    data: sanitizeResponse(response.data),
  };
};
