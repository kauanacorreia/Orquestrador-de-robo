import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { RatePoint } from '../../models/dashboard.model';

function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

@Component({
  selector: 'app-rate-chart',
  imports: [BaseChartDirective],
  templateUrl: './rate-chart.html',
  styleUrl: './rate-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RateChart {
  readonly data = input<RatePoint[]>([]);
  readonly label = input.required<string>();
  readonly color = input<string>('#1976d2');

  readonly chartType = 'line' as const;

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: this.data().map((point) => formatDayLabel(point.date)),
    datasets: [
      {
        label: this.label(),
        data: this.data().map((point) => Number((point.rate * 100).toFixed(1))),
        borderColor: this.color(),
        backgroundColor: this.color(),
        tension: 0.3,
        fill: false,
      },
    ],
  }));

  readonly chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Dia' } },
      y: {
        title: { display: true, text: '%' },
        beginAtZero: true,
        max: 100,
      },
    },
  };
}
