import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export type KpiCardVariant = 'default' | 'success' | 'danger';
export type KpiCardEmphasis = 'value' | 'secondaryValue';

@Component({
  selector: 'app-kpi-card',
  imports: [MatCardModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly secondaryValue = input<string | number | null | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly variant = input<KpiCardVariant>('default');
  readonly emphasis = input<KpiCardEmphasis>('value');
  readonly attention = input<boolean>(false);
}
