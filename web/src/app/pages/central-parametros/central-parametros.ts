import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Robot } from '../../core/models/robot.model';
import { RobotService } from '../../core/services/robot.service';

import {
  CompanyOption,
  CompanyRobotConfigResponse,
  ParameterField
} from '../../features/company-robot-config/models/company-robot-config.model';

import { CompanyRobotConfigService } from '../../features/company-robot-config/services/company-robot-config.service';

@Component({
  selector: 'app-central-parametros',
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
    MatSnackBarModule
  ],
  templateUrl: './central-parametros.html',
  styleUrl: './central-parametros.scss'
})
export class CentralParametros implements OnInit {
  private readonly configService = inject(CompanyRobotConfigService);
  private readonly robotService = inject(RobotService);
  private readonly snackBar = inject(MatSnackBar);

  companies = signal<CompanyOption[]>([]);
  robots = signal<Robot[]>([]);

  selectedCompanyId = signal('');
  selectedRobotId = signal('');

  configuration = signal<CompanyRobotConfigResponse | null>(null);

  loadingOptions = signal(true);
  loadingConfiguration = signal(false);
  saving = signal(false);

  errorMessage = signal('');

  parametersForm = new FormGroup({});

  ngOnInit(): void {
    this.loadOptions();
  }

  private loadOptions(): void {
    this.loadingOptions.set(true);
    this.errorMessage.set('');

    forkJoin({
      companies: this.configService.listCompanies(),
      robots: this.robotService.list()
    }).subscribe({
      next: ({ companies, robots }) => {
        this.companies.set(companies);
        this.robots.set(robots);
        this.loadingOptions.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Não foi possível carregar empresas e robôs.'
        );
        this.loadingOptions.set(false);
      }
    });
  }

  onCompanyChange(companyId: string): void {
    this.selectedCompanyId.set(companyId);
    this.loadConfiguration();
  }

  onRobotChange(robotId: string): void {
    this.selectedRobotId.set(robotId);
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    const companyId = this.selectedCompanyId();
    const robotId = this.selectedRobotId();

    this.configuration.set(null);
    this.parametersForm = new FormGroup({});

    if (!companyId || !robotId) {
      return;
    }

    this.loadingConfiguration.set(true);
    this.errorMessage.set('');

    this.configService
      .getConfiguration(companyId, robotId)
      .subscribe({
        next: (configuration) => {
          this.configuration.set(configuration);

          this.buildDynamicForm(
            configuration.robot.schema?.fields ?? [],
            configuration.parameters ?? {}
          );

          this.loadingConfiguration.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'Não foi possível carregar a configuração deste robô.'
          );
          this.loadingConfiguration.set(false);
        }
      });
  }

  private buildDynamicForm(
    fields: ParameterField[],
    parameters: Record<string, unknown>
  ): void {
    const controls: Record<string, FormControl> = {};

    for (const field of fields) {
      const initialValue =
        parameters[field.name] ??
        (this.isBoolean(field) ? false : '');

      controls[field.name] = new FormControl(
        initialValue,
        field.required ? [Validators.required] : []
      );
    }

    this.parametersForm = new FormGroup(controls);
  }

  save(): void {
    const companyId = this.selectedCompanyId();
    const robotId = this.selectedRobotId();

    if (!companyId || !robotId) {
      return;
    }

    if (this.parametersForm.invalid) {
      this.parametersForm.markAllAsTouched();

      this.snackBar.open(
        'Preencha todos os campos obrigatórios.',
        'Fechar',
        { duration: 3500 }
      );

      return;
    }

    this.saving.set(true);

    this.configService
      .saveConfiguration(
        companyId,
        robotId,
        this.parametersForm.getRawValue()
      )
      .subscribe({
        next: () => {
          this.saving.set(false);

          this.snackBar.open(
            'Configurações salvas com sucesso.',
            'Fechar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          this.saving.set(false);

          const message =
            error?.error?.error ??
            'Não foi possível salvar as configurações.';

          this.snackBar.open(message, 'Fechar', {
            duration: 4500
          });
        }
      });
  }

  fieldLabel(field: ParameterField): string {
    return field.label?.trim() || field.name;
  }

  inputType(field: ParameterField): string {
    switch (this.normalizedType(field.type)) {
      case 'password':
        return 'password';

      case 'number':
      case 'numero':
        return 'number';

      default:
        return 'text';
    }
  }

  isBoolean(field: ParameterField): boolean {
    const type = this.normalizedType(field.type);

    return type === 'boolean' || type === 'booleano';
  }

  private normalizedType(type: string): string {
    return (type ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}