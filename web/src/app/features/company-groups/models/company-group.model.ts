export interface CompanyGroup {
  id: string;
  name: string;
  companies_count: number;
  company_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface CompanyGroupPayload {
  name: string;
  company_ids: string[];
}