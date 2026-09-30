import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DashboardSummary } from '../../models/dashboard.model';
import { KpiCard } from '../kpi-card/kpi-card';

@Component({
  selector: 'app-dashboard-kpis',
  imports: [KpiCard],
  templateUrl: './dashboard-kpis.html',
  styleUrl: './dashboard-kpis.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpis {
  readonly summary = input.required<DashboardSummary>();

  formatPercent(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
  }
}
