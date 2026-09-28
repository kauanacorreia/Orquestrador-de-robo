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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
import { ProfileService } from '../../core/services/profile.service';

import { CompanyOption } from '../../features/company-robot-config/models/company-robot-config.model';
import { CompanyRobotConfigService } from '../../features/company-robot-config/services/company-robot-config.service';

import {
  Schedule,
  SchedulePayload
} from '../../features/scheduler/models/schedule.model';

import { ScheduleService } from '../../features/scheduler/services/schedule.service';

type EditorMode = 'create' | 'edit' | null;
type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'custom';

const WEEKDAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

const WEEKDAY_SET = new Set([1, 2, 3, 4, 5]);

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
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
  private readonly profileService = inject(ProfileService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly weekdays = WEEKDAYS;
  readonly isAdmin = this.profileService.isAdmin;

  schedules = signal<Schedule[]>([]);
  companies = signal<CompanyOption[]>([]);
  robots = signal<Robot[]>([]);

  loading = signal(true);
  errorMessage = signal('');

  savingSchedule = signal(false);
  runningId = signal<string | null>(null);

  editorMode = signal<EditorMode>(null);
  editingSchedule = signal<Schedule | null>(null);

  selectedDays = signal<Set<number>>(new Set());
  recurrenceType = signal<RecurrenceType>('daily');

  pageIndex = signal(0);
  pageSize = signal(10);

  scheduleForm = this.fb.nonNullable.group({
    company_id: ['', [Validators.required]],
    robot_id: ['', [Validators.required]],
    starts_on: [new Date(), [Validators.required]],
    time: ['08:00', [Validators.required]],
    status: ['ACTIVE' as Schedule['status']]
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

  pagedSchedules = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedSchedules().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadAll();
    this.profileService.loadIfNeeded();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
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
      starts_on: new Date(),
      time: '08:00',
      status: 'ACTIVE'
    });

    this.selectedDays.set(new Set());
    this.recurrenceType.set('daily');
  }

  openEdit(schedule: Schedule): void {
    this.editorMode.set('edit');
    this.editingSchedule.set(schedule);

    const startsOn = schedule.starts_on
      ? new Date(`${schedule.starts_on}T00:00:00`)
      : new Date();

    this.scheduleForm.reset({
      company_id: schedule.company_id,
      robot_id: schedule.robot_id,
      starts_on: startsOn,
      time: schedule.time ?? '08:00',
      status: schedule.status
    });

    const days = schedule.days_of_week ?? [];
    this.selectedDays.set(new Set(days));
    this.recurrenceType.set(this.inferRecurrenceType(days, startsOn));
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
    if (this.recurrenceType() !== 'custom') {
      return;
    }

    const days = new Set(this.selectedDays());

    if (days.has(day)) {
      days.delete(day);
    } else {
      days.add(day);
    }

    this.selectedDays.set(days);
  }

  onRecurrenceTypeChange(type: RecurrenceType): void {
    this.recurrenceType.set(type);

    if (type === 'daily') {
      this.selectedDays.set(new Set());
    } else if (type === 'weekdays') {
      this.selectedDays.set(new Set(WEEKDAY_SET));
    } else if (type === 'weekly') {
      this.selectedDays.set(new Set([this.startsOnWeekday()]));
    }
  }

  onStartsOnChange(): void {
    if (this.recurrenceType() === 'weekly') {
      this.selectedDays.set(new Set([this.startsOnWeekday()]));
    }
  }

  private startsOnWeekday(): number {
    const startsOn = this.scheduleForm.controls.starts_on.value;
    return startsOn ? startsOn.getDay() : new Date().getDay();
  }

  private inferRecurrenceType(
    days: number[],
    startsOn: Date
  ): RecurrenceType {
    if (days.length === 0 || days.length === 7) {
      return 'daily';
    }

    const sorted = [...days].sort();

    if (
      sorted.length === WEEKDAY_SET.size &&
      sorted.every(day => WEEKDAY_SET.has(day))
    ) {
      return 'weekdays';
    }

    if (sorted.length === 1 && sorted[0] === startsOn.getDay()) {
      return 'weekly';
    }

    return 'custom';
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
    const current = this.editingSchedule();
    const isEdit = this.editorMode() === 'edit' && !!current;

    const payload: SchedulePayload = {
      company_id: value.company_id,
      robot_id: value.robot_id,
      time: value.time,
      days_of_week: Array.from(this.selectedDays()).sort(),
      starts_on: toDateInputValue(value.starts_on),
      ...(isEdit ? { status: value.status } : {})
    };

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
