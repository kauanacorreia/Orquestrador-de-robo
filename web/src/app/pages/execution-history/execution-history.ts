import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Robot } from '../../core/models/robot.model';
import { RobotService } from '../../core/services/robot.service';

import { CompanyOption } from '../../features/company-robot-config/models/company-robot-config.model';
import { CompanyRobotConfigService } from '../../features/company-robot-config/services/company-robot-config.service';

import {
  Execution,
  ExecutionLogEntry,
  ExecutionStatus
} from '../../features/execution-history/models/execution.model';

import { ExecutionService } from '../../features/execution-history/services/execution.service';

type StatusFilter = ExecutionStatus | 'ALL';

@Component({
  selector: 'app-execution-history',
  standalone: true,
  imports: [
    CommonModule,

    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './execution-history.html',
  styleUrl: './execution-history.scss'
})
export class ExecutionHistory implements OnInit {
  private readonly executionService = inject(ExecutionService);
  private readonly companyService = inject(CompanyRobotConfigService);
  private readonly robotService = inject(RobotService);

  companies = signal<CompanyOption[]>([]);
  robots = signal<Robot[]>([]);

  executions = signal<Execution[]>([]);
  total = signal(0);

  loading = signal(true);
  errorMessage = signal('');

  companyFilter = signal('');
  robotFilter = signal('');
  statusFilter = signal<StatusFilter>('ALL');

  pageIndex = signal(0);
  pageSize = signal(10);

  logsPanelOpen = signal(false);
  selectedExecution = signal<Execution | null>(null);
  logs = signal<ExecutionLogEntry[]>([]);
  loadingLogs = signal(false);

  ngOnInit(): void {
    forkJoin({
      companies: this.companyService.listCompanies(),
      robots: this.robotService.list()
    }).subscribe({
      next: ({ companies, robots }) => {
        this.companies.set(companies);
        this.robots.set(robots);

        this.fetchExecutions();
      },

      error: () => {
        this.errorMessage.set('Não foi possível carregar os filtros.');
        this.loading.set(false);
      }
    });
  }

  private fetchExecutions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.executionService
      .list({
        company_id: this.companyFilter() || undefined,
        robot_id: this.robotFilter() || undefined,
        status:
          this.statusFilter() === 'ALL'
            ? undefined
            : (this.statusFilter() as ExecutionStatus),
        page: this.pageIndex() + 1,
        page_size: this.pageSize()
      })
      .subscribe({
        next: response => {
          this.executions.set(response.data);
          this.total.set(response.total);

          this.loading.set(false);
        },

        error: () => {
          this.errorMessage.set(
            'Não foi possível carregar o histórico de execuções.'
          );

          this.loading.set(false);
        }
      });
  }

  setCompanyFilter(value: string): void {
    this.companyFilter.set(value);
    this.pageIndex.set(0);
    this.fetchExecutions();
  }

  setRobotFilter(value: string): void {
    this.robotFilter.set(value);
    this.pageIndex.set(0);
    this.fetchExecutions();
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.fetchExecutions();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.fetchExecutions();
  }

  openLogs(execution: Execution): void {
    this.selectedExecution.set(execution);
    this.logsPanelOpen.set(true);
    this.loadingLogs.set(true);
    this.logs.set([]);

    this.executionService.logs(execution.id).subscribe({
      next: logs => {
        this.logs.set(logs);
        this.loadingLogs.set(false);
      },

      error: () => {
        this.loadingLogs.set(false);
      }
    });
  }

  closeLogs(): void {
    this.logsPanelOpen.set(false);
    this.selectedExecution.set(null);
    this.logs.set([]);
  }

  statusLabel(status: ExecutionStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'RUNNING':
        return 'Em execução';
      case 'SUCCESS':
        return 'Sucesso';
      case 'FAILED':
        return 'Falhou';
      default:
        return status;
    }
  }

  triggeredByLabel(execution: Execution): string {
    return execution.triggered_by === 'scheduled'
      ? 'Agendado'
      : 'Manual';
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatDuration(durationMs: number | null): string {
    if (durationMs === null || durationMs === undefined) {
      return '—';
    }

    const seconds = durationMs / 1000;

    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    return `${minutes}min ${remainingSeconds}s`;
  }
}
