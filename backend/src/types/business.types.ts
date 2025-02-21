import { BranchInfo } from "./email.types";
import { Branch } from "@prisma/client";

interface BusinessData {
  business: {
    id: string;
    user_id: string;
    company_name: string;
    legal_name: string;
    tax_number: string;
    business_license: string;
    business_type: string;
    registration_number: string;
    is_verified: boolean;
    verification_documents: string;
    logo: string | null;
    website: string | null;
    working_hours: string;
    branch?: BranchInfo;
  };
}
