export type UUID = string;

export type EstimateStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'won'
  | 'lost'
  | 'archived';

export interface Estimate {
  id: UUID;
  company_id: UUID | null; // Optional: kept for future flexibility
  customer_id: UUID | null;
  opportunity_id: UUID | null;
  project_id: UUID | null;

  title: string;
  reference: string | null;
  status: EstimateStatus;

  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;

  created_by: UUID | null;
  updated_by: UUID | null;
  created_at: string;
  updated_at: string;
  converted_project_id?: UUID | null;
  converted_at?: string | null;
  converted_from_quote_version_id?: UUID | null;
}

