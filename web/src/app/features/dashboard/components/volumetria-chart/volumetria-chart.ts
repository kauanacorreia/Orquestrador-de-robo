import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConfiguration, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { VolumetriaPoint } from '../../models/dashboard.model';

function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

function formatPercent(part: number, total: number): string {
  if (total === 0) {
    return '0,0%';
  }

  return `${((part / total) * 100).toFixed(1).replace('.', ',')}%`;
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

  // Além do valor de cada barra, o tooltip mostra o valor bruto do dia
  // (total de execuções) e a taxa de sucesso/falha daquele dia.
  readonly chartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const points = this.data();

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, title: { display: true, text: 'Dia' } },
        y: { stacked: true, title: { display: true, text: 'Execuções' }, beginAtZero: true },
      },
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: (items: TooltipItem<'bar'>[]) => {
              const point = points[items[0]?.dataIndex ?? -1];

              if (!point) {
                return [];
              }

              return [
                '',
                `Total (bruto): ${point.executions} execuções`,
                `Taxa de sucesso: ${formatPercent(point.success, point.executions)}`,
                `Taxa de falha: ${formatPercent(point.failure, point.executions)}`,
              ];
            },
          },
        },
      },
    };
  });
}
