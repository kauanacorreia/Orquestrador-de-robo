import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import {
  ActivityLogStatus,
  DashboardFilterOptions,
  DashboardFilters,
  PeriodPreset,
} from '../../models/dashboard.model';
import { defaultDashboardFilters, resolvePeriodRange } from '../../utils/period.util';
import {
  AutocompleteOption,
  MultiAutocompleteField,
} from '../multi-autocomplete-field/multi-autocomplete-field';

interface Option<T> {
  value: T;
  label: string;
}

// Atalhos de "tempo fixo" oferecidos dentro do próprio calendário.
const QUICK_PRESETS: Option<PeriodPreset>[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
];

const STATUS_OPTIONS: Option<ActivityLogStatus>[] = [
  { value: 'success', label: 'Sucesso' },
  { value: 'started', label: 'Em execução' },
  { value: 'failure', label: 'Falha' },
];

function toDate(isoDate: string | null | undefined): Date | null {
  if (!isoDate) {
    return null;
  }

  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-dashboard-filters',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MultiAutocompleteField,
  ],
  templateUrl: './dashboard-filters.html',
  styleUrl: './dashboard-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFiltersPanel implements OnChanges {
  @Input({ required: true }) filters!: DashboardFilters;
  @Input() filterOptions: DashboardFilterOptions | null = null;
  @Output() filtersChange = new EventEmitter<DashboardFilters>();

  readonly quickPresets = QUICK_PRESETS;
  readonly statusOptions = STATUS_OPTIONS;

  // Calendário de período: sempre aparece já como o range atual (o filtro
  // abre "personalizado" por padrão — ver defaultDashboardFilters).
  readonly rangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  robotOptions(): AutocompleteOption[] {
    return (this.filterOptions?.robots ?? []).map((robot) => ({ id: robot.id, name: robot.name }));
  }

  clientOptions(): AutocompleteOption[] {
    return (this.filterOptions?.clients ?? []).map((client) => ({ id: client.id, name: client.name }));
  }

  userOptions(): AutocompleteOption[] {
    return (this.filterOptions?.users ?? []).map((user) => ({ id: user.id, name: user.name }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.syncRangeForm();
    }
  }

  private syncRangeForm(): void {
    this.rangeForm.setValue(
      { start: toDate(this.filters.startDate), end: toDate(this.filters.endDate) },
      { emitEvent: false },
    );
  }

  // Atalho de tempo fixo clicado dentro do calendário: aplica o range e
  // fecha o popup.
  onPeriodPresetChange(preset: PeriodPreset, picker?: MatDateRangePicker<Date>): void {
    if (preset === 'custom') {
      this.emit({ ...this.filters, periodPreset: preset });
      return;
    }

    const { startDate, endDate } = resolvePeriodRange(preset, new Date());
    this.emit({ ...this.filters, periodPreset: preset, startDate, endDate });

    picker?.close();
  }

  // Usuário editou o range diretamente no calendário: vira "personalizado".
  onRangeChange(): void {
    const { start, end } = this.rangeForm.getRawValue();

    if (!start || !end) {
      return;
    }

    this.emit({
      ...this.filters,
      periodPreset: 'custom',
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
    });
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
