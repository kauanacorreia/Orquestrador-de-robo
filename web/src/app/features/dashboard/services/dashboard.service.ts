import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ActivityLog,
  DashboardFilterOptions,
  DashboardFilterOptionsDto,
  DashboardFilters,
  DashboardSummary,
  DashboardSummaryDto,
  VolumetriaPoint,
  VolumetriaPointDto,
} from '../models/dashboard.model';
import { generateMockLog, toDashboardFilterOptions, toDashboardSummary, toVolumetriaPoint } from './dashboard.mapper';

function toFilterParams(filters: DashboardFilters): HttpParams {
  let params = new HttpParams().set('start_date', filters.startDate).set('end_date', filters.endDate);

  for (const robotId of filters.robotIds) {
    params = params.append('robot_ids[]', robotId);
  }

  for (const clientId of filters.clientIds) {
    params = params.append('client_ids[]', clientId);
  }

  for (const userId of filters.userIds) {
    params = params.append('user_ids[]', userId);
  }

  for (const status of filters.statuses) {
    params = params.append('statuses[]', status);
  }

  return params;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getDashboardSummary(filters: DashboardFilters): Observable<DashboardSummary> {
    return this.http
      .get<DashboardSummaryDto>(`${this.baseUrl}/dashboard/summary`, { params: toFilterParams(filters) })
      .pipe(map(toDashboardSummary));
  }

  getVolumetria(filters: DashboardFilters): Observable<VolumetriaPoint[]> {
    return this.http
      .get<VolumetriaPointDto[]>(`${this.baseUrl}/dashboard/volumetria`, { params: toFilterParams(filters) })
      .pipe(map((dtos) => dtos.map(toVolumetriaPoint)));
  }

  getFilterOptions(): Observable<DashboardFilterOptions> {
    return this.http
      .get<DashboardFilterOptionsDto>(`${this.baseUrl}/dashboard/filter_options`)
      .pipe(map(toDashboardFilterOptions));
  }

  generateMockLog(): ActivityLog {
    return generateMockLog();
  }
}
