import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ActivityLog, DashboardFilterOptions, DashboardSummary, VolumetriaPoint } from '../models/dashboard.model';
import { defaultDashboardFilters } from '../utils/period.util';
import { DashboardStore } from './dashboard-store.service';
import { DashboardService } from './dashboard.service';

const summary: DashboardSummary = {
  totalExecutions: 1250,
  successCount: 1180,
  successRate: 0.944,
  failureCount: 70,
  failureRate: 0.056,
  failuresLast24h: 12,
  failuresLast24hRate: 0.08,
  activeRobots: 4,
  activeUsers: 1,
  clients: 2,
};

const volumetria: VolumetriaPoint[] = [
  { date: '2026-08-17', executions: 10, success: 8, failure: 2 },
  { date: '2026-08-18', executions: 0, success: 0, failure: 0 },
];

const filterOptions: DashboardFilterOptions = { robots: [], clients: [], users: [] };

function buildLog(overrides: Partial<ActivityLog>): ActivityLog {
  return {
    id: '1',
    timestamp: '2026-08-17T10:00:00.000Z',
    robotId: 'robot-1',
    robotName: 'Robô Faturamento',
    clientId: 'client-1',
    clientName: 'Simpliss',
    userId: 'user-1',
    userName: 'Ana Ribeiro',
    status: 'success',
    step: 'Conferência',
    ...overrides,
  };
}

describe('DashboardStore', () => {
  let store: DashboardStore;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(() => {
    dashboardServiceSpy = jasmine.createSpyObj<DashboardService>('DashboardService', [
      'getDashboardSummary',
      'getVolumetria',
      'getFilterOptions',
      'generateMockLog',
    ]);

    TestBed.configureTestingModule({
      providers: [DashboardStore, { provide: DashboardService, useValue: dashboardServiceSpy }],
    });

    store = TestBed.inject(DashboardStore);
  });

  it('starts with the default 7-day filters and empty data', () => {
    expect(store.filters()).toEqual(defaultDashboardFilters(new Date()));
    expect(store.summary()).toBeNull();
    expect(store.volumetria()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadDashboard', () => {
    it('sets loading, then fills summary and volumetria on success', () => {
      dashboardServiceSpy.getDashboardSummary.and.returnValue(of(summary));
      dashboardServiceSpy.getVolumetria.and.returnValue(of(volumetria));

      store.loadDashboard();

      expect(dashboardServiceSpy.getDashboardSummary).toHaveBeenCalledWith(store.filters());
      expect(store.summary()).toEqual(summary);
      expect(store.volumetria()).toEqual(volumetria);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('sets the error and clears loading on failure', () => {
      dashboardServiceSpy.getDashboardSummary.and.returnValue(throwError(() => new Error('falha na API')));
      dashboardServiceSpy.getVolumetria.and.returnValue(of(volumetria));

      store.loadDashboard();

      expect(store.error()).toBe('falha na API');
      expect(store.loading()).toBe(false);
    });
  });

  describe('setFilters', () => {
    it('updates the filters and reloads the dashboard', () => {
      dashboardServiceSpy.getDashboardSummary.and.returnValue(of(summary));
      dashboardServiceSpy.getVolumetria.and.returnValue(of(volumetria));

      const newFilters = { ...defaultDashboardFilters(new Date()), periodPreset: '30d' as const };
      store.setFilters(newFilters);

      expect(store.filters()).toEqual(newFilters);
      expect(dashboardServiceSpy.getDashboardSummary).toHaveBeenCalledWith(newFilters);
    });
  });

  describe('loadFilterOptions', () => {
    it('fills filterOptions on success', () => {
      dashboardServiceSpy.getFilterOptions.and.returnValue(of(filterOptions));

      store.loadFilterOptions();

      expect(store.filterOptions()).toEqual(filterOptions);
    });
  });

  describe('rate series', () => {
    it('derives success and failure rate per day, guarding against division by zero', () => {
      dashboardServiceSpy.getDashboardSummary.and.returnValue(of(summary));
      dashboardServiceSpy.getVolumetria.and.returnValue(of(volumetria));

      store.loadDashboard();

      expect(store.successRateSeries()).toEqual([
        { date: '2026-08-17', rate: 0.8 },
        { date: '2026-08-18', rate: 0 },
      ]);
      expect(store.failureRateSeries()).toEqual([
        { date: '2026-08-17', rate: 0.2 },
        { date: '2026-08-18', rate: 0 },
      ]);
    });
  });

  describe('log polling', () => {
    it('prepends a generated log on each tick and stops after stopLogPolling', fakeAsync(() => {
      dashboardServiceSpy.generateMockLog.and.returnValue(buildLog({ id: 'polled' }));

      store.startLogPolling();
      tick(2500);
      tick(2500);

      expect(store.filteredLogs().length).toBe(2);
      expect(store.filteredLogs()[0].id).toBe('polled');

      store.stopLogPolling();
      tick(2500);

      expect(store.filteredLogs().length).toBe(2);
    }));

    it('caps the log list at 30 items, keeping the most recent first', fakeAsync(() => {
      let counter = 0;
      dashboardServiceSpy.generateMockLog.and.callFake(() => buildLog({ id: `log-${counter++}` }));

      store.startLogPolling();
      tick(2500 * 31);
      store.stopLogPolling();

      expect(store.filteredLogs().length).toBe(30);
      expect(store.filteredLogs()[0].id).toBe('log-30');
    }));

    it('filters the polled logs by the currently selected robot', fakeAsync(() => {
      dashboardServiceSpy.generateMockLog.and.returnValues(
        buildLog({ id: '1', robotId: 'robot-1' }),
        buildLog({ id: '2', robotId: 'robot-2' }),
      );
      dashboardServiceSpy.getDashboardSummary.and.returnValue(of(summary));
      dashboardServiceSpy.getVolumetria.and.returnValue(of(volumetria));

      store.startLogPolling();
      tick(2500);
      tick(2500);
      store.stopLogPolling();

      store.setFilters({ ...store.filters(), robotIds: ['robot-1'] });

      expect(store.filteredLogs().map((log) => log.id)).toEqual(['1']);
    }));
  });
});
