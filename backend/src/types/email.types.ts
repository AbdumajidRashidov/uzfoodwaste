// src/types/email.types.ts
import {
  Prisma,
  Business,
  BusinessLocation,
  Branch,
  Customer,
  ReservationItem,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface ListingWithBranch {
  id: string;
  title: string;
  description: string;
  price: Prisma.Decimal;
  original_price: Prisma.Decimal;
  quantity: number;
  unit: string;
  expiry_date: Date;
  pickup_start: Date;
  pickup_end: Date;
  status: string;
  business: Business;
  location: BusinessLocation;
  branch: Branch | null;
}

export interface BranchInfo {
  name: string;
  branch_code: string;
  operating_hours?: string;
  manager_name?: string;
  manager_phone?: string;
}

export interface ReservationEmailData {
  reservationId: string;
  listing: ListingWithBranch;
  pickup_time: Date;
  pickup_address: string;
  branch_info?: BranchInfo | null;
  customer: Customer | null;
  items: {
    title: string;
    quantity: number;
    price: Decimal;
    business_name: string;
    pickup_address: string;
  };
}

export interface PaymentConfirmationEmailData {
  reservationId: string;
  qrCode: string;
  confirmationCode: string;
  amount: number;
  currency: string;
  branch_info?: BranchInfo | null;
  pickup_address: string;
  business_name: string;
  items: {
    title: string;
    quantity: number;
    price: Decimal;
  }[];
}

export interface ReservationStatusUpdateEmailData {
  reservationId: string;
  status: string;
  listing: ListingWithBranch;
  cancellation_reason?: string;
  pickup_address: string;
  branch_info?: BranchInfo | null;
  customer: Customer | null;
  items?: {
    title: string;
    quantity: number;
    price: Decimal;
    business_name: string;
    pickup_address: string;
  };
}
