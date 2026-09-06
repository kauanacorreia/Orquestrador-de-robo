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
  private readonly baseUrl = `${environment.apiUrl}/v1`;

  listCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(
      `${this.baseUrl}/companies`
    );
  }

  getCompany(companyId: string): Observable<Company> {
    return this.http.get<Company>(
      `${this.baseUrl}/companies/${companyId}`
    );
  }

  createCompany(
    payload: CompanyPayload
  ): Observable<Company> {
    return this.http.post<Company>(
      `${this.baseUrl}/companies`,
      payload
    );
  }

  updateCompany(
    companyId: string,
    payload: CompanyPayload
  ): Observable<Company> {
    return this.http.patch<Company>(
      `${this.baseUrl}/companies/${companyId}`,
      payload
    );
  }

  toggleStatus(companyId: string): Observable<Company> {
    return this.http.patch<Company>(
      `${this.baseUrl}/companies/${companyId}/toggle_status`,
      {}
    );
  }

  getConfiguration(
    companyId: string,
    robotId: string
  ): Observable<CompanyRobotConfigResponse> {
    return this.http.get<CompanyRobotConfigResponse>(
      `${this.baseUrl}/companies/${companyId}/robots/${robotId}`
    );
  }

  saveConfiguration(
    companyId: string,
    robotId: string,
    parameters: Record<string, unknown>
  ): Observable<SaveCompanyRobotConfigResponse> {
    return this.http.put<SaveCompanyRobotConfigResponse>(
      `${this.baseUrl}/companies/${companyId}/robots/${robotId}`,
      { parameters }
    );
  }
}