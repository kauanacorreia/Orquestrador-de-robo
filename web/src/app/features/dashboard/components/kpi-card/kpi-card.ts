import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type KpiCardVariant = 'default' | 'success' | 'danger' | 'critical';

export interface KpiCardRow {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-kpi-card',
  imports: [MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();

  // Legenda logo abaixo do valor bruto (ex: "finalizadas com êxito").
  readonly unitLabel = input<string | undefined>(undefined);

  // Linha secundária de taxa, sempre abaixo do valor bruto (ex: label
  // "Taxa de sucesso" + secondaryValue "94,4%"). Padronizado: o bruto
  // sempre vem primeiro, a taxa sempre embaixo.
  readonly rateLabel = input<string | undefined>(undefined);
  readonly secondaryValue = input<string | number | null | undefined>(undefined);

  // Ícone (nome do Material Icon) exibido antes do rateLabel, ex: "check_circle"
  // na taxa de sucesso global.
  readonly rateIcon = input<string | undefined>(undefined);

  // Linha divisória acima da seção de taxa (usado no card de "Automações com sucesso").
  readonly showDivider = input<boolean>(false);

  // Lista de linhas label/valor exibida no lugar de unitLabel + taxa, para
  // cards com múltiplos indicadores (ex: "Robô mais crítico").
  readonly rows = input<KpiCardRow[] | undefined>(undefined);

  readonly subtitle = input<string | undefined>(undefined);
  readonly variant = input<KpiCardVariant>('default');
  readonly attention = input<boolean>(false);

  // Acessibilidade: descrição do KPI, exibida ao passar o mouse (ou focar,
  // via teclado) no ícone de ajuda.
  readonly tooltip = input<string | undefined>(undefined);
}
