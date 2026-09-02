import { Injectable, computed, inject, signal } from '@angular/core';
import { Subject, forkJoin, interval, takeUntil } from 'rxjs';

import {
  ActivityLog,
  DashboardFilterOptions,
  DashboardFilters,
  DashboardSummary,
  RatePoint,
  VolumetriaPoint,
} from '../models/dashboard.model';
import { defaultDashboardFilters } from '../utils/period.util';
import { DashboardService } from './dashboard.service';

const LOG_POLLING_INTERVAL_MS = 2500;
const MAX_LOGS = 30;

@Injectable({
  providedIn: 'root',
})
export class DashboardStore {
  private readonly dashboardService = inject(DashboardService);
  private stopPolling$: Subject<void> | null = null;

  private readonly summarySignal = signal<DashboardSummary | null>(null);
  private readonly volumetriaSignal = signal<VolumetriaPoint[]>([]);
  private readonly logsSignal = signal<ActivityLog[]>([]);
  private readonly filtersSignal = signal<DashboardFilters>(defaultDashboardFilters(new Date()));
  private readonly filterOptionsSignal = signal<DashboardFilterOptions | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly summary = this.summarySignal.asReadonly();
  readonly volumetria = this.volumetriaSignal.asReadonly();
  readonly filters = this.filtersSignal.asReadonly();
  readonly filterOptions = this.filterOptionsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly filteredLogs = computed<ActivityLog[]>(() => {
    const filters = this.filtersSignal();

    return this.logsSignal().filter((log) => {
      const matchesRobot = filters.robotIds.length === 0 || filters.robotIds.includes(log.robotId);
      const matchesClient = filters.clientIds.length === 0 || filters.clientIds.includes(log.clientId);
      const matchesUser = filters.userIds.length === 0 || filters.userIds.includes(log.userId);
      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(log.status);

      return matchesRobot && matchesClient && matchesUser && matchesStatus;
    });
  });

  readonly successRateSeries = computed<RatePoint[]>(() =>
    this.volumetriaSignal().map((point) => ({
      date: point.date,
      rate: point.executions === 0 ? 0 : point.success / point.executions,
    })),
  );

  readonly failureRateSeries = computed<RatePoint[]>(() =>
    this.volumetriaSignal().map((point) => ({
      date: point.date,
      rate: point.executions === 0 ? 0 : point.failure / point.executions,
    })),
  );

  loadDashboard(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    forkJoin([
      this.dashboardService.getDashboardSummary(this.filtersSignal()),
      this.dashboardService.getVolumetria(this.filtersSignal()),
    ]).subscribe({
      next: ([summary, volumetria]) => {
        this.summarySignal.set(summary);
        this.volumetriaSignal.set(volumetria);
        this.loadingSignal.set(false);
      },
      error: (error: Error) => {
        this.errorSignal.set(error.message ?? 'Erro desconhecido');
        this.loadingSignal.set(false);
      },
    });
  }

  loadFilterOptions(): void {
    this.dashboardService.getFilterOptions().subscribe({
      next: (filterOptions) => this.filterOptionsSignal.set(filterOptions),
      error: () => this.filterOptionsSignal.set(null),
    });
  }

  setFilters(filters: DashboardFilters): void {
    this.filtersSignal.set(filters);
    this.loadDashboard();
  }

  startLogPolling(): void {
    this.stopLogPolling();
    this.stopPolling$ = new Subject<void>();

    interval(LOG_POLLING_INTERVAL_MS)
      .pipe(takeUntil(this.stopPolling$))
      .subscribe(() => {
        const log = this.dashboardService.generateMockLog();
        this.logsSignal.update((logs) => [log, ...logs].slice(0, MAX_LOGS));
      });
  }

  stopLogPolling(): void {
    this.stopPolling$?.next();
    this.stopPolling$?.complete();
    this.stopPolling$ = null;
  }
}
