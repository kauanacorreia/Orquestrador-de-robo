import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ActivityTable } from '../../features/dashboard/components/activity-table/activity-table';
import { DashboardFiltersPanel } from '../../features/dashboard/components/dashboard-filters/dashboard-filters';
import { DashboardKpis } from '../../features/dashboard/components/dashboard-kpis/dashboard-kpis';
import { VolumetriaChart } from '../../features/dashboard/components/volumetria-chart/volumetria-chart';
import { DashboardStore } from '../../features/dashboard/services/dashboard-store.service';
import { DashboardFilters } from '../../features/dashboard/models/dashboard.model';

export const ACTIVITY_LIMIT_OPTIONS = [10, 25, 50] as const;

@Component({
  selector: 'app-home',
  imports: [DashboardKpis, VolumetriaChart, ActivityTable, DashboardFiltersPanel, FormsModule, MatFormFieldModule, MatSelectModule],
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
  readonly loading = this.dashboardStore.loading;
  readonly error = this.dashboardStore.error;

  readonly activityLimitOptions = ACTIVITY_LIMIT_OPTIONS;

  // Quantidade de atividades em tempo real exibidas na tela. Padrão 10,
  // mas o usuário pode aumentar (o polling em si continua acumulando mais
  // no store; aqui só limitamos o que é renderizado).
  readonly activityLimit = signal<number>(10);

  readonly visibleLogs = computed(() => this.logs().slice(0, this.activityLimit()));

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

  setActivityLimit(limit: number): void {
    this.activityLimit.set(limit);
  }
}
