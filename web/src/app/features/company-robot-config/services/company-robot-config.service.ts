import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  CompanyOption,
  CompanyRobotConfigResponse,
  SaveCompanyRobotConfigResponse
} from '../models/company-robot-config.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyRobotConfigService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1`;

  listCompanies(): Observable<CompanyOption[]> {
    return this.http.get<CompanyOption[]>(`${this.baseUrl}/companies`);
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