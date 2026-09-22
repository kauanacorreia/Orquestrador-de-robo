import { RobotSchema } from '../../../core/models/robot.model';

export type CompanyStatus =
  'ACTIVE'
  | 'INACTIVE';


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

  /**
   * Quantidade de robôs vinculados à empresa.
   */
  robots_count: number;

  /**
   * Indica se a senha de acesso já foi cadastrada.
   * A senha propriamente dita não deve ser retornada pela API.
   */
  access_password_configured: boolean;

  /**
   * Indica se a frase secreta já foi cadastrada.
   */
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

  /**
   * Enviar somente quando uma nova senha
   * estiver sendo cadastrada ou alterada.
   */
  access_password?: string;

  /**
   * Enviar somente quando uma nova frase
   * estiver sendo cadastrada ou alterada.
   */
  secret_phrase?: string;

}


/**
 * Informações do robô retornadas na
 * configuração Empresa x Robô.
 */
export interface RobotConfigInfo {

  id: string;

  name: string;

  schema: RobotSchema;

}


/**
 * Dados básicos da empresa retornados
 * junto da configuração.
 */
export interface CompanyConfigInfo {

  id: string;

  name: string;

}


/**
 * Retorno da consulta da configuração
 * Empresa x Robô.
 */
export interface CompanyRobotConfigResponse {

  company: CompanyConfigInfo;

  robot: RobotConfigInfo;

  parameters: Record<string, unknown>;

}


/**
 * Retorno após salvar a configuração
 * Empresa x Robô.
 */
export interface SaveCompanyRobotConfigResponse {

  id: string;

  company_id: string;

  robot_id: string;

  parameters: Record<string, unknown>;

  updated_at: string;

}