import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { VolumetriaPoint } from '../../models/dashboard.model';

function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

@Component({
  selector: 'app-volumetria-chart',
  imports: [BaseChartDirective],
  templateUrl: './volumetria-chart.html',
  styleUrl: './volumetria-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumetriaChart {
  readonly data = input<VolumetriaPoint[]>([]);

  readonly chartType = 'bar' as const;

  readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.data().map((point) => formatDayLabel(point.date)),
    datasets: [
      {
        label: 'Sucesso',
        data: this.data().map((point) => point.success),
        backgroundColor: '#2e7d32',
        stack: 'executions',
      },
      {
        label: 'Falha',
        data: this.data().map((point) => point.failure),
        backgroundColor: '#c62828',
        stack: 'executions',
      },
    ],
  }));

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, title: { display: true, text: 'Dia' } },
      y: { stacked: true, title: { display: true, text: 'Execuções' }, beginAtZero: true },
    },
  };
}
