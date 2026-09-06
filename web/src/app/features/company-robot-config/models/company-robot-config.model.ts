export type CompanyStatus = 'ACTIVE' | 'INACTIVE';

export interface CompanyOption {
  id: string;
  code: string | null;
  name: string;
  status: CompanyStatus;
}

export interface Company extends CompanyOption {
  company_folder: string | null;
  cnpj: string;
  state_registration: string | null;
  tax_regime: string | null;
  simple_national_opt_in: boolean;
  pis_pasep: string | null;
  monetary_variation: string | null;
  account_number: string | null;
  notification_email: string | null;

  access_password_configured: boolean;
  secret_phrase_configured: boolean;

  created_at: string;
  updated_at: string;
}

export interface CompanyPayload {
  code: string;
  name: string;
  company_folder?: string | null;
  cnpj: string;
  state_registration?: string | null;
  tax_regime?: string | null;
  simple_national_opt_in: boolean;
  pis_pasep?: string | null;
  monetary_variation?: string | null;
  account_number?: string | null;
  notification_email?: string | null;
  access_password?: string;
  secret_phrase?: string;
}

export interface ParameterField {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
}

export interface RobotParameterSchema {
  fields: ParameterField[];
}

export interface RobotConfigInfo {
  id: string;
  name: string;
  schema: RobotParameterSchema;
}

export interface CompanyConfigInfo {
  id: string;
  name: string;
}

export interface CompanyRobotConfigResponse {
  company: CompanyConfigInfo;
  robot: RobotConfigInfo;
  parameters: Record<string, unknown>;
}

export interface SaveCompanyRobotConfigResponse {
  id: string;
  company_id: string;
  robot_id: string;
  parameters: Record<string, unknown>;
  updated_at: string;
}