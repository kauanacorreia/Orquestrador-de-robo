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
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Robot } from '../../core/models/robot.model';
import { RobotService } from '../../core/services/robot.service';

import {
  Company,
  CompanyPayload,
  CompanyRobotConfigResponse,
  ParameterField
} from '../../features/company-robot-config/models/company-robot-config.model';

import { CompanyRobotConfigService } from '../../features/company-robot-config/services/company-robot-config.service';

type EditorMode = 'create' | 'edit' | null;

type StatusFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'INACTIVE';

type CompanySort =
  | 'name_asc'
  | 'name_desc'
  | 'code_asc'
  | 'code_desc';

@Component({
  selector: 'app-central-parametros',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './central-parametros.html',
  styleUrl: './central-parametros.scss'
})
export class CentralParametros implements OnInit {
  private readonly configService =
    inject(CompanyRobotConfigService);

  private readonly robotService =
    inject(RobotService);

  private readonly snackBar =
    inject(MatSnackBar);

  private readonly fb =
    inject(FormBuilder);

  companies = signal<Company[]>([]);
  robots = signal<Robot[]>([]);

  loading = signal(true);
  loadingConfiguration = signal(false);
  savingCompany = signal(false);
  savingConfiguration = signal(false);

  errorMessage = signal('');

  searchTerm = signal('');
  statusFilter = signal<StatusFilter>('ALL');
  sortOption = signal<CompanySort>('name_asc');

  pageIndex = signal(0);
  pageSize = signal(10);

  editorMode = signal<EditorMode>(null);
  editingCompany = signal<Company | null>(null);

  selectedRobotId = signal('');

  configuration =
    signal<CompanyRobotConfigResponse | null>(null);

  parametersForm = new FormGroup({});

  companyForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    company_folder: [''],
    cnpj: ['', [Validators.required]],
    state_registration: [''],
    tax_regime: [''],
    simple_national_opt_in: [false],
    pis_pasep: [''],
    monetary_variation: [''],
    account_number: [''],
    access_password: [''],
    secret_phrase: ['']
  });

  filteredCompanies = computed(() => {
    const search =
      this.normalizeText(this.searchTerm());

    const status = this.statusFilter();
    const sort = this.sortOption();

    const filtered = this.companies().filter(
      company => {
        const matchesStatus =
          status === 'ALL' ||
          company.status === status;

        if (!matchesStatus) {
          return false;
        }

        if (!search) {
          return true;
        }

        const text = this.normalizeText(
          `${company.code ?? ''} ${company.name}`
        );

        return text.includes(search);
      }
    );

    return [...filtered].sort((a, b) => {
      const nameComparison =
        (a.name ?? '').localeCompare(
          b.name ?? '',
          'pt-BR',
          {
            sensitivity: 'base',
            numeric: true
          }
        );

      const codeComparison =
        (a.code ?? '').localeCompare(
          b.code ?? '',
          'pt-BR',
          {
            sensitivity: 'base',
            numeric: true
          }
        );

      switch (sort) {
        case 'name_desc':
          return nameComparison * -1;

        case 'code_asc':
          return codeComparison;

        case 'code_desc':
          return codeComparison * -1;

        case 'name_asc':
        default:
          return nameComparison;
      }
    });
  });

  pagedCompanies = computed(() => {
    const start =
      this.pageIndex() * this.pageSize();

    const end =
      start + this.pageSize();

    return this.filteredCompanies().slice(
      start,
      end
    );
  });

  ngOnInit(): void {
    this.loadOptions();
  }

  private loadOptions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      companies:
        this.configService.listCompanies(),

      robots:
        this.robotService.list()
    }).subscribe({
      next: ({ companies, robots }) => {
        this.companies.set(companies);
        this.robots.set(robots);

        this.loading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Não foi possível carregar as empresas.'
        );

        this.loading.set(false);
      }
    });
  }

  private loadCompanies(): void {
    this.configService
      .listCompanies()
      .subscribe({
        next: companies => {
          this.companies.set(companies);

          const current =
            this.editingCompany();

          if (current) {
            const updated =
              companies.find(
                company =>
                  company.id === current.id
              );

            if (updated) {
              this.editingCompany.set(updated);
            }
          }
        },

        error: () => {
          this.snackBar.open(
            'Não foi possível atualizar a lista de empresas.',
            'Fechar',
            {
              duration: 4000
            }
          );
        }
      });
  }

  setSearch(value: string): void {
    this.searchTerm.set(value);
    this.pageIndex.set(0);
  }

  setStatusFilter(
    value: StatusFilter
  ): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
  }

  setSort(
    value: CompanySort
  ): void {
    this.sortOption.set(value);
    this.pageIndex.set(0);
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openCreate(): void {
    this.editorMode.set('create');
    this.editingCompany.set(null);

    this.companyForm.reset({
      code: '',
      name: '',
      company_folder: '',
      cnpj: '',
      state_registration: '',
      tax_regime: '',
      simple_national_opt_in: false,
      pis_pasep: '',
      monetary_variation: '',
      account_number: '',
      access_password: '',
      secret_phrase: ''
    });

    this.resetRobotConfiguration();
  }

  openEdit(company: Company): void {
    this.editorMode.set('edit');
    this.editingCompany.set(company);

    this.fillCompanyForm(company);
    this.resetRobotConfiguration();
  }

  closeEditor(): void {
    if (
      this.savingCompany() ||
      this.savingConfiguration()
    ) {
      return;
    }

    this.editorMode.set(null);
    this.editingCompany.set(null);

    this.companyForm.reset();

    this.resetRobotConfiguration();
  }

  private fillCompanyForm(
    company: Company
  ): void {
    this.companyForm.reset({
      code: company.code ?? '',
      name: company.name ?? '',
      company_folder:
        company.company_folder ?? '',
      cnpj: company.cnpj ?? '',
      state_registration:
        company.state_registration ?? '',
      tax_regime:
        company.tax_regime ?? '',
      simple_national_opt_in:
        company.simple_national_opt_in ??
        false,
      pis_pasep:
        company.pis_pasep ?? '',
      monetary_variation:
        company.monetary_variation ?? '',
      account_number:
        company.account_number ?? '',
      access_password: '',
      secret_phrase: ''
    });
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();

      this.snackBar.open(
        'Preencha os campos obrigatórios.',
        'Fechar',
        {
          duration: 3500
        }
      );

      return;
    }

    const payload =
      this.buildCompanyPayload();

    const current =
      this.editingCompany();

    this.savingCompany.set(true);

    const request =
      this.editorMode() === 'edit' &&
      current
        ? this.configService.updateCompany(
            current.id,
            payload
          )
        : this.configService.createCompany(
            payload
          );

    request.subscribe({
      next: company => {
        this.savingCompany.set(false);

        if (
          this.editorMode() === 'create'
        ) {
          this.editorMode.set('edit');
          this.editingCompany.set(company);

          this.fillCompanyForm(company);

          this.snackBar.open(
            'Empresa cadastrada. Agora você pode configurar os robôs.',
            'Fechar',
            {
              duration: 4000
            }
          );
        } else {
          this.editingCompany.set(company);
          this.fillCompanyForm(company);

          this.snackBar.open(
            'Empresa atualizada com sucesso.',
            'Fechar',
            {
              duration: 3000
            }
          );
        }

        this.loadCompanies();
      },

      error: error => {
        this.savingCompany.set(false);

        this.snackBar.open(
          this.apiErrorMessage(
            error,
            'Não foi possível salvar a empresa.'
          ),
          'Fechar',
          {
            duration: 5000
          }
        );
      }
    });
  }

  private buildCompanyPayload():
    CompanyPayload {
    const value =
      this.companyForm.getRawValue();

    const payload: CompanyPayload = {
      code: value.code.trim(),
      name: value.name.trim(),

      company_folder:
        this.nullIfBlank(
          value.company_folder
        ),

      cnpj: value.cnpj.trim(),

      state_registration:
        this.nullIfBlank(
          value.state_registration
        ),

      tax_regime:
        this.nullIfBlank(
          value.tax_regime
        ),

      simple_national_opt_in:
        value.simple_national_opt_in,

      pis_pasep:
        this.nullIfBlank(
          value.pis_pasep
        ),

      monetary_variation:
        this.nullIfBlank(
          value.monetary_variation
        ),

      account_number:
        this.nullIfBlank(
          value.account_number
        )
    };

    const password =
      value.access_password.trim();

    const secretPhrase =
      value.secret_phrase.trim();

    if (password) {
      payload.access_password =
        password;
    }

    if (secretPhrase) {
      payload.secret_phrase =
        secretPhrase;
    }

    return payload;
  }

  toggleStatus(
    company: Company
  ): void {
    this.configService
      .toggleStatus(company.id)
      .subscribe({
        next: updated => {
          this.replaceCompany(updated);

          if (
            this.editingCompany()?.id ===
            updated.id
          ) {
            this.editingCompany.set(updated);
          }

          this.snackBar.open(
            updated.status === 'ACTIVE'
              ? 'Empresa ativada com sucesso.'
              : 'Empresa desativada com sucesso.',
            'Fechar',
            {
              duration: 3000
            }
          );
        },

        error: () => {
          this.snackBar.open(
            'Não foi possível alterar o status da empresa.',
            'Fechar',
            {
              duration: 4000
            }
          );
        }
      });
  }

  toggleCurrentCompanyStatus(): void {
    const company =
      this.editingCompany();

    if (!company) {
      return;
    }

    this.toggleStatus(company);
  }

  private replaceCompany(
    updated: Company
  ): void {
    this.companies.update(
      companies =>
        companies.map(company =>
          company.id === updated.id
            ? updated
            : company
        )
    );
  }

  onRobotChange(
    robotId: string
  ): void {
    this.selectedRobotId.set(robotId);
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    const company =
      this.editingCompany();

    const robotId =
      this.selectedRobotId();

    this.configuration.set(null);
    this.parametersForm =
      new FormGroup({});

    if (
      !company ||
      !robotId
    ) {
      return;
    }

    this.loadingConfiguration.set(true);

    this.configService
      .getConfiguration(
        company.id,
        robotId
      )
      .subscribe({
        next: configuration => {
          this.configuration.set(
            configuration
          );

          this.buildDynamicForm(
            configuration.robot.schema
              ?.fields ?? [],
            configuration.parameters ?? {}
          );

          this.loadingConfiguration.set(
            false
          );
        },

        error: () => {
          this.loadingConfiguration.set(
            false
          );

          this.snackBar.open(
            'Não foi possível carregar a configuração deste robô.',
            'Fechar',
            {
              duration: 4000
            }
          );
        }
      });
  }

  saveRobotConfiguration(): void {
    const company =
      this.editingCompany();

    const robotId =
      this.selectedRobotId();

    if (!company || !robotId) {
      return;
    }

    if (this.parametersForm.invalid) {
      this.parametersForm.markAllAsTouched();

      this.snackBar.open(
        'Preencha os parâmetros obrigatórios.',
        'Fechar',
        {
          duration: 3500
        }
      );

      return;
    }

    this.savingConfiguration.set(true);

    this.configService
      .saveConfiguration(
        company.id,
        robotId,
        this.parametersForm.getRawValue()
      )
      .subscribe({
        next: () => {
          this.savingConfiguration.set(
            false
          );

          this.snackBar.open(
            'Configuração do robô salva com sucesso.',
            'Fechar',
            {
              duration: 3000
            }
          );
        },

        error: error => {
          this.savingConfiguration.set(
            false
          );

          this.snackBar.open(
            this.apiErrorMessage(
              error,
              'Não foi possível salvar a configuração do robô.'
            ),
            'Fechar',
            {
              duration: 4500
            }
          );
        }
      });
  }

  private buildDynamicForm(
    fields: ParameterField[],
    parameters: Record<
      string,
      unknown
    >
  ): void {
    const controls: Record<
      string,
      FormControl
    > = {};

    for (const field of fields) {
      const initialValue =
        parameters[field.name] ??
        (
          this.isBoolean(field)
            ? false
            : ''
        );

      controls[field.name] =
        new FormControl(
          initialValue,
          field.required
            ? [Validators.required]
            : []
        );
    }

    this.parametersForm =
      new FormGroup(controls);
  }

  private resetRobotConfiguration():
    void {
    this.selectedRobotId.set('');
    this.configuration.set(null);

    this.parametersForm =
      new FormGroup({});

    this.loadingConfiguration.set(false);
  }

  companyStatusLabel(
    status: string
  ): string {
    return status === 'ACTIVE'
      ? 'Ativa'
      : 'Inativa';
  }

  fieldLabel(
    field: ParameterField
  ): string {
    return (
      field.label?.trim() ||
      field.name
    );
  }

  inputType(
    field: ParameterField
  ): string {
    switch (
      this.normalizedType(field.type)
    ) {
      case 'password':
      case 'senha':
        return 'password';

      case 'number':
      case 'numero':
        return 'number';

      case 'email':
        return 'email';

      default:
        return 'text';
    }
  }

  isBoolean(
    field: ParameterField
  ): boolean {
    const type =
      this.normalizedType(field.type);

    return (
      type === 'boolean' ||
      type === 'booleano'
    );
  }

  private normalizedType(
    type: string
  ): string {
    return (type ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  private normalizeText(
    value: string
  ): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  private nullIfBlank(
    value: string
  ): string | null {
    const normalized =
      value.trim();

    return normalized
      ? normalized
      : null;
  }

  private apiErrorMessage(
    error: any,
    fallback: string
  ): string {
    const errors =
      error?.error?.errors;

    if (
      Array.isArray(errors) &&
      errors.length
    ) {
      return errors.join(' ');
    }

    return (
      error?.error?.error ??
      fallback
    );
  }
}