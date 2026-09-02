import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { DashboardFilterOptionsDto, DashboardFilters, DashboardSummaryDto, VolumetriaPointDto } from '../models/dashboard.model';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const filters: DashboardFilters = {
    periodPreset: '7d',
    startDate: '2026-08-18',
    endDate: '2026-08-24',
    robotIds: ['robot-1'],
    clientIds: ['client-1'],
    userIds: [],
    statuses: ['failure'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getDashboardSummary sends the filters as query params and maps the dto to camelCase', () => {
    const dto: DashboardSummaryDto = {
      total_executions: 1250,
      success_count: 1180,
      success_rate: 0.944,
      failure_count: 70,
      failure_rate: 0.056,
      failures_last_24h: 12,
      failures_last_24h_rate: 0.08,
      active_robots: 3,
      active_users: 12,
      clients: 34,
    };

    let result: unknown;
    service.getDashboardSummary(filters).subscribe((summary) => (result = summary));

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.apiUrl}/dashboard/summary` &&
        request.params.get('start_date') === '2026-08-18' &&
        request.params.get('end_date') === '2026-08-24' &&
        request.params.getAll('robot_ids[]')?.[0] === 'robot-1' &&
        request.params.getAll('statuses[]')?.[0] === 'failure',
    );
    expect(req.request.method).toBe('GET');
    req.flush(dto);

    expect(result).toEqual({
      totalExecutions: 1250,
      successCount: 1180,
      successRate: 0.944,
      failureCount: 70,
      failureRate: 0.056,
      failuresLast24h: 12,
      failuresLast24hRate: 0.08,
      activeRobots: 3,
      activeUsers: 12,
      clients: 34,
    });
  });

  it('getVolumetria sends the filters as query params and maps each dto to camelCase', () => {
    const dtos: VolumetriaPointDto[] = [
      { date: '2026-08-18', executions: 10, success: 8, failure: 2 },
      { date: '2026-08-19', executions: 15, success: 13, failure: 2 },
    ];

    let result: unknown;
    service.getVolumetria(filters).subscribe((points) => (result = points));

    const req = httpMock.expectOne(
      (request) => request.url === `${environment.apiUrl}/dashboard/volumetria` && request.params.get('start_date') === '2026-08-18',
    );
    expect(req.request.method).toBe('GET');
    req.flush(dtos);

    expect(result).toEqual([
      { date: '2026-08-18', executions: 10, success: 8, failure: 2 },
      { date: '2026-08-19', executions: 15, success: 13, failure: 2 },
    ]);
  });

  it('getFilterOptions calls the correct endpoint and maps the dto to camelCase', () => {
    const dto: DashboardFilterOptionsDto = {
      robots: [{ id: 'robot-1', name: 'Robô Faturamento' }],
      clients: [{ id: 'client-1', name: 'Simpliss' }],
      users: [{ id: 'user-1', name: 'Ana Ribeiro' }],
    };

    let result: unknown;
    service.getFilterOptions().subscribe((options) => (result = options));

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/filter_options`);
    expect(req.request.method).toBe('GET');
    req.flush(dto);

    expect(result).toEqual({
      robots: [{ id: 'robot-1', name: 'Robô Faturamento' }],
      clients: [{ id: 'client-1', name: 'Simpliss' }],
      users: [{ id: 'user-1', name: 'Ana Ribeiro' }],
    });
  });

  it('generateMockLog returns a valid ActivityLog', () => {
    const log = service.generateMockLog();

    expect(log.id).toBeTruthy();
    expect(['success', 'started', 'failure']).toContain(log.status);
  });
});
