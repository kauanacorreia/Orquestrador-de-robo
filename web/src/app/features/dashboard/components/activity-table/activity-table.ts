import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { ActivityLog, ActivityLogStatus } from '../../models/dashboard.model';

const STATUS_LABEL: Record<ActivityLogStatus, string> = {
  success: 'Sucesso',
  started: 'Em execução',
  failure: 'Falha',
};

@Component({
  selector: 'app-activity-table',
  imports: [MatTableModule, DatePipe],
  templateUrl: './activity-table.html',
  styleUrl: './activity-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityTable {
  readonly logs = input<ActivityLog[]>([]);

  readonly displayedColumns = ['timestamp', 'status', 'robotName', 'step'];

  readonly rows = computed(() => this.logs());

  statusLabel(status: ActivityLogStatus): string {
    return STATUS_LABEL[status];
  }
}
