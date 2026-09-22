import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  Company,
  CompanyPayload,
  CompanyRobotConfigResponse,
  SaveCompanyRobotConfigResponse
} from '../models/company-robot-config.model';


@Injectable({
  providedIn: 'root'
})
export class CompanyRobotConfigService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/v1`;


  /**
   * Lista todas as empresas.
   */
  listCompanies(): Observable<Company[]> {

    return this.http.get<Company[]>(
      `${this.baseUrl}/companies`
    );

  }


  /**
   * Busca uma empresa específica.
   */
  getCompany(
    companyId: string
  ): Observable<Company> {

    return this.http.get<Company>(
      `${this.baseUrl}/companies/${companyId}`
    );

  }


  /**
   * Cadastra uma nova empresa.
   */
  createCompany(
    payload: CompanyPayload
  ): Observable<Company> {

    return this.http.post<Company>(
      `${this.baseUrl}/companies`,
      payload
    );

  }


  /**
   * Atualiza uma empresa existente.
   */
  updateCompany(
    companyId: string,
    payload: CompanyPayload
  ): Observable<Company> {

    return this.http.patch<Company>(
      `${this.baseUrl}/companies/${companyId}`,
      payload
    );

  }


  /**
   * Alterna o status da empresa
   * entre ativo e inativo.
   */
  toggleStatus(
    companyId: string
  ): Observable<Company> {

    return this.http.patch<Company>(
      `${this.baseUrl}/companies/${companyId}/toggle_status`,
      {}
    );

  }


  /**
   * Consulta a configuração de um robô
   * para uma empresa específica.
   *
   * A resposta inclui:
   * - Empresa
   * - Robô
   * - Schema do robô
   * - Parâmetros já cadastrados
   */
  getConfiguration(
    companyId: string,
    robotId: string
  ): Observable<CompanyRobotConfigResponse> {

    return this.http.get<CompanyRobotConfigResponse>(
      `${this.baseUrl}/companies/${companyId}/robots/${robotId}`
    );

  }


  /**
   * Salva ou atualiza os parâmetros
   * de um robô para uma empresa.
   */
  saveConfiguration(
    companyId: string,
    robotId: string,
    parameters: Record<string, unknown>
  ): Observable<SaveCompanyRobotConfigResponse> {

    return this.http.put<SaveCompanyRobotConfigResponse>(
      `${this.baseUrl}/companies/${companyId}/robots/${robotId}`,
      {
        parameters
      }
    );

  }

}