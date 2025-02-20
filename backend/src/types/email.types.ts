// src/types/email.types.ts
import { Prisma, Business, BusinessLocation, Branch } from "@prisma/client";

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
}

export interface PaymentConfirmationEmailData {
  reservationId: string;
  qrCode: string;
  confirmationCode: string;
  amount: number;
  currency: string;
  pickup_address: string;
  listing_title: string;
  business_name: string;
  branch_info?: BranchInfo | null;
}

export interface ReservationStatusUpdateEmailData {
  reservationId: string;
  status: string;
  listing: ListingWithBranch;
  cancellation_reason?: string;
  pickup_address: string;
  branch_info?: BranchInfo | null;
}
