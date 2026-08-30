export interface CompanyOption {
  id: string;
  name: string;
  status: string;
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