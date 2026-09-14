import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Robot } from '../../core/models/robot.model';
import { RobotService } from '../../core/services/robot.service';

import { CompanyOption } from '../../features/company-robot-config/models/company-robot-config.model';
import { CompanyRobotConfigService } from '../../features/company-robot-config/services/company-robot-config.service';

import {
  Schedule,
  SchedulePayload
} from '../../features/scheduler/models/schedule.model';

import { ScheduleService } from '../../features/scheduler/services/schedule.service';

type EditorMode = 'create' | 'edit' | null;

const WEEKDAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './scheduler.html',
  styleUrl: './scheduler.scss'
})
export class Scheduler implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly companyService = inject(CompanyRobotConfigService);
  private readonly robotService = inject(RobotService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly weekdays = WEEKDAYS;

  schedules = signal<Schedule[]>([]);
  companies = signal<CompanyOption[]>([]);
  robots = signal<Robot[]>([]);

  loading = signal(true);
  errorMessage = signal('');

  savingSchedule = signal(false);
  runningId = signal<string | null>(null);
  togglingId = signal<string | null>(null);

  editorMode = signal<EditorMode>(null);
  editingSchedule = signal<Schedule | null>(null);

  selectedDays = signal<Set<number>>(new Set());

  scheduleForm = this.fb.nonNullable.group({
    company_id: ['', [Validators.required]],
    robot_id: ['', [Validators.required]],
    time: ['08:00', [Validators.required]]
  });

  sortedSchedules = computed(() =>
    [...this.schedules()].sort((a, b) => {
      const companyCompare = (a.company_name ?? '').localeCompare(
        b.company_name ?? '',
        'pt-BR',
        { sensitivity: 'base' }
      );

      if (companyCompare !== 0) {
        return companyCompare;
      }

      return (a.robot_name ?? '').localeCompare(
        b.robot_name ?? '',
        'pt-BR',
        { sensitivity: 'base' }
      );
    })
  );

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      schedules: this.scheduleService.list(),
      companies: this.companyService.listCompanies(),
      robots: this.robotService.list()
    }).subscribe({
      next: ({ schedules, companies, robots }) => {
        this.schedules.set(schedules);
        this.companies.set(companies);
        this.robots.set(robots);

        this.loading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Não foi possível carregar os agendamentos.'
        );

        this.loading.set(false);
      }
    });
  }

  private reloadSchedules(): void {
    this.scheduleService.list().subscribe({
      next: schedules => this.schedules.set(schedules),

      error: () => {
        this.snackBar.open(
          'Não foi possível atualizar a lista de agendamentos.',
          'Fechar',
          { duration: 4000 }
        );
      }
    });
  }

  openCreate(): void {
    this.editorMode.set('create');
    this.editingSchedule.set(null);

    this.scheduleForm.reset({
      company_id: '',
      robot_id: '',
      time: '08:00'
    });

    this.selectedDays.set(new Set());
  }

  openEdit(schedule: Schedule): void {
    this.editorMode.set('edit');
    this.editingSchedule.set(schedule);

    this.scheduleForm.reset({
      company_id: schedule.company_id,
      robot_id: schedule.robot_id,
      time: schedule.time ?? '08:00'
    });

    this.selectedDays.set(new Set(schedule.days_of_week ?? []));
  }

  closeEditor(): void {
    if (this.savingSchedule()) {
      return;
    }

    this.editorMode.set(null);
    this.editingSchedule.set(null);
    this.scheduleForm.reset();
  }

  isDaySelected(day: number): boolean {
    return this.selectedDays().has(day);
  }

  toggleDay(day: number): void {
    const days = new Set(this.selectedDays());

    if (days.has(day)) {
      days.delete(day);
    } else {
      days.add(day);
    }

    this.selectedDays.set(days);
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();

      this.snackBar.open('Preencha os campos obrigatórios.', 'Fechar', {
        duration: 3500
      });

      return;
    }

    const value = this.scheduleForm.getRawValue();

    const payload: SchedulePayload = {
      company_id: value.company_id,
      robot_id: value.robot_id,
      time: value.time,
      days_of_week: Array.from(this.selectedDays()).sort()
    };

    const current = this.editingSchedule();
    const isEdit = this.editorMode() === 'edit' && !!current;

    this.savingSchedule.set(true);

    const request = isEdit && current
      ? this.scheduleService.update(current.id, payload)
      : this.scheduleService.create(payload);

    request.subscribe({
      next: () => {
        this.savingSchedule.set(false);
        this.editorMode.set(null);
        this.editingSchedule.set(null);

        this.snackBar.open(
          isEdit
            ? 'Agendamento atualizado com sucesso.'
            : 'Agendamento criado com sucesso.',
          'Fechar',
          { duration: 3000 }
        );

        this.reloadSchedules();
      },

      error: error => {
        this.savingSchedule.set(false);

        this.snackBar.open(
          this.apiErrorMessage(
            error,
            'Não foi possível salvar o agendamento.'
          ),
          'Fechar',
          { duration: 5000 }
        );
      }
    });
  }

  toggleStatus(schedule: Schedule): void {
    this.togglingId.set(schedule.id);

    this.scheduleService.toggleStatus(schedule.id).subscribe({
      next: updated => {
        this.togglingId.set(null);

        this.schedules.update(schedules =>
          schedules.map(item =>
            item.id === updated.id ? updated : item
          )
        );
      },

      error: () => {
        this.togglingId.set(null);

        this.snackBar.open(
          'Não foi possível alterar o status do agendamento.',
          'Fechar',
          { duration: 4000 }
        );
      }
    });
  }

  runNow(schedule: Schedule): void {
    this.runningId.set(schedule.id);

    this.scheduleService.runNow(schedule.id).subscribe({
      next: () => {
        this.runningId.set(null);

        this.snackBar.open(
          'Execução disparada. Acompanhe no Histórico de Execuções.',
          'Fechar',
          { duration: 4000 }
        );
      },

      error: () => {
        this.runningId.set(null);

        this.snackBar.open(
          'Não foi possível executar o agendamento agora.',
          'Fechar',
          { duration: 4000 }
        );
      }
    });
  }

  statusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Ativo' : 'Pausado';
  }

  formatNextExecution(value: string | null): string {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private apiErrorMessage(error: any, fallback: string): string {
    const errors = error?.error?.errors;

    if (Array.isArray(errors) && errors.length) {
      return errors.join(' ');
    }

    return error?.error?.error ?? fallback;
  }
}
