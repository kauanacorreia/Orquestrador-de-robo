import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  ActivityLogStatus,
  DashboardFilterOptions,
  DashboardFilters,
  PeriodPreset,
} from '../../models/dashboard.model';
import { defaultDashboardFilters, resolvePeriodRange } from '../../utils/period.util';

interface Option<T> {
  value: T;
  label: string;
}

const PERIOD_PRESETS: Option<PeriodPreset>[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'custom', label: 'Personalizado' },
];

const STATUS_OPTIONS: Option<ActivityLogStatus>[] = [
  { value: 'success', label: 'Sucesso' },
  { value: 'started', label: 'Em execução' },
  { value: 'failure', label: 'Falha' },
];

@Component({
  selector: 'app-dashboard-filters',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule],
  templateUrl: './dashboard-filters.html',
  styleUrl: './dashboard-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFiltersPanel {
  @Input({ required: true }) filters!: DashboardFilters;
  @Input() filterOptions: DashboardFilterOptions | null = null;
  @Output() filtersChange = new EventEmitter<DashboardFilters>();

  readonly periodPresets = PERIOD_PRESETS;
  readonly statusOptions = STATUS_OPTIONS;

  onPeriodPresetChange(preset: PeriodPreset): void {
    if (preset === 'custom') {
      this.emit({ ...this.filters, periodPreset: preset });
      return;
    }

    const { startDate, endDate } = resolvePeriodRange(preset, new Date());
    this.emit({ ...this.filters, periodPreset: preset, startDate, endDate });
  }

  onCustomStartChange(value: string): void {
    if (!value) {
      return;
    }
    this.emit({ ...this.filters, periodPreset: 'custom', startDate: value });
  }

  onCustomEndChange(value: string): void {
    if (!value) {
      return;
    }
    this.emit({ ...this.filters, periodPreset: 'custom', endDate: value });
  }

  onRobotsChange(robotIds: string[]): void {
    this.emit({ ...this.filters, robotIds });
  }

  onClientsChange(clientIds: string[]): void {
    this.emit({ ...this.filters, clientIds });
  }

  onUsersChange(userIds: string[]): void {
    this.emit({ ...this.filters, userIds });
  }

  onStatusesChange(statuses: ActivityLogStatus[]): void {
    this.emit({ ...this.filters, statuses });
  }

  clearFilters(): void {
    this.emit(defaultDashboardFilters(new Date()));
  }

  private emit(filters: DashboardFilters): void {
    this.filtersChange.emit(filters);
  }
}
