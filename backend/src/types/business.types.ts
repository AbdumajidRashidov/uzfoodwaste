import { Branch } from "@prisma/client";

export interface BusinessType {
  business: {
    id: string;
    is_verified: boolean;
    user_id: string;
    working_hours: string;
    company_name: string;
    legal_name: string;
    tax_number: string;
    business_license: string;
    business_type: string;
    registration_number: string;
    verification_documents: string;
    logo: string | null;
    website: string | null;
    branch?: Branch; // Add this line with optional chaining
  };
}
