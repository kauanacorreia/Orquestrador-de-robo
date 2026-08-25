import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { ActivityTable } from '../../features/dashboard/components/activity-table/activity-table';
import { DashboardFiltersPanel } from '../../features/dashboard/components/dashboard-filters/dashboard-filters';
import { KpiCard } from '../../features/dashboard/components/kpi-card/kpi-card';
import { RateChart } from '../../features/dashboard/components/rate-chart/rate-chart';
import { VolumetriaChart } from '../../features/dashboard/components/volumetria-chart/volumetria-chart';
import { DashboardStore } from '../../features/dashboard/services/dashboard-store.service';
import { DashboardFilters } from '../../features/dashboard/models/dashboard.model';
import { formatPeriodLabel } from '../../features/dashboard/utils/period.util';

@Component({
  selector: 'app-home',
  imports: [KpiCard, VolumetriaChart, RateChart, ActivityTable, DashboardFiltersPanel],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly dashboardStore = inject(DashboardStore);

  readonly summary = this.dashboardStore.summary;
  readonly volumetria = this.dashboardStore.volumetria;
  readonly logs = this.dashboardStore.filteredLogs;
  readonly filters = this.dashboardStore.filters;
  readonly filterOptions = this.dashboardStore.filterOptions;
  readonly successRateSeries = this.dashboardStore.successRateSeries;
  readonly failureRateSeries = this.dashboardStore.failureRateSeries;
  readonly loading = this.dashboardStore.loading;
  readonly error = this.dashboardStore.error;

  ngOnInit(): void {
    this.dashboardStore.loadDashboard();
    this.dashboardStore.loadFilterOptions();
    this.dashboardStore.startLogPolling();
  }

  ngOnDestroy(): void {
    this.dashboardStore.stopLogPolling();
  }

  onFiltersChange(filters: DashboardFilters): void {
    this.dashboardStore.setFilters(filters);
  }

  periodLabel(filters: DashboardFilters): string {
    return formatPeriodLabel(filters);
  }
}
