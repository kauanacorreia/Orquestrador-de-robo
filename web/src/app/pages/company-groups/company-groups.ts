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

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Company
} from '../../features/company-robot-config/models/company-robot-config.model';

import {
  CompanyRobotConfigService
} from '../../features/company-robot-config/services/company-robot-config.service';

import {
  CompanyGroup,
  CompanyGroupPayload
} from '../../features/company-groups/models/company-group.model';

import {
  CompanyGroupService
} from '../../features/company-groups/services/company-group.service';


type EditorMode =
  | 'create'
  | 'edit'
  | null;


@Component({
  selector: 'app-company-groups',

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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],

  templateUrl: './company-groups.html',
  styleUrl: './company-groups.scss'
})
export class CompanyGroups
  implements OnInit {

  /* =========================================================
     SERVICES
     ========================================================= */

  private readonly groupService =
    inject(CompanyGroupService);

  private readonly companyService =
    inject(CompanyRobotConfigService);

  private readonly snackBar =
    inject(MatSnackBar);

  private readonly fb =
    inject(FormBuilder);


  /* =========================================================
     DADOS
     ========================================================= */

  groups =
    signal<CompanyGroup[]>([]);

  companies =
    signal<Company[]>([]);


  /* =========================================================
     ESTADOS
     ========================================================= */

  loading =
    signal(true);

  loadingGroup =
    signal(false);

  saving =
    signal(false);

  errorMessage =
    signal('');


  /* =========================================================
     FILTROS DA LISTAGEM
     ========================================================= */

  searchTerm =
    signal('');


  /* =========================================================
     PAGINAÇÃO
     ========================================================= */

  pageIndex =
    signal(0);

  pageSize =
    signal(10);


  /* =========================================================
     DRAWER
     ========================================================= */

  editorMode =
    signal<EditorMode>(
      null
    );

  editingGroup =
    signal<CompanyGroup | null>(
      null
    );


  /* =========================================================
     EMPRESAS DO GRUPO
     ========================================================= */

  companySearchTerm =
    signal('');

  selectedCompanyIds =
    signal<Set<string>>(
      new Set()
    );


  /* =========================================================
     FORM
     ========================================================= */

  groupForm =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(120)
        ]
      ]

    });


  /* =========================================================
     GRUPOS FILTRADOS
     ========================================================= */

  filteredGroups =
    computed(() => {

      const search =
        this.normalizeText(
          this.searchTerm()
        );

      const groups =
        [...this.groups()]
          .sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
                'pt-BR',
                {
                  sensitivity: 'base',
                  numeric: true
                }
              )
          );

      if (!search) {
        return groups;
      }

      return groups.filter(
        group =>
          this.normalizeText(
            group.name
          ).includes(search)
      );
    });


  /* =========================================================
     PAGINAÇÃO
     ========================================================= */

  pagedGroups =
    computed(() => {

      const start =
        this.pageIndex() *
        this.pageSize();

      return this
        .filteredGroups()
        .slice(
          start,
          start + this.pageSize()
        );
    });


  /* =========================================================
     EMPRESAS FILTRADAS
     ========================================================= */

  filteredCompanies =
    computed(() => {

      const search =
        this.normalizeText(
          this.companySearchTerm()
        );

      const companies =
        [...this.companies()]
          .sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
                'pt-BR',
                {
                  sensitivity: 'base',
                  numeric: true
                }
              )
          );

      if (!search) {
        return companies;
      }

      return companies.filter(
        company => {

          const searchableText =
            this.normalizeText(
              [
                company.code ?? '',
                company.name,
                company.cnpj ?? ''
              ].join(' ')
            );

          return searchableText
            .includes(search);
        }
      );
    });


  selectedCount =
    computed(
      () =>
        this.selectedCompanyIds()
          .size
    );


  allVisibleSelected =
    computed(() => {

      const visible =
        this.filteredCompanies();

      if (
        visible.length === 0
      ) {
        return false;
      }

      const selected =
        this.selectedCompanyIds();

      return visible.every(
        company =>
          selected.has(
            company.id
          )
      );
    });


  /* =========================================================
     INIT
     ========================================================= */

  ngOnInit(): void {
    this.loadData();
  }


  /* =========================================================
     CARREGAMENTO
     ========================================================= */

  private loadData(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({

      groups:
        this.groupService
          .list(),

      companies:
        this.companyService
          .listCompanies()

    }).subscribe({

      next: ({
        groups,
        companies
      }) => {

        this.groups.set(groups);
        this.companies.set(companies);

        this.loading.set(false);
      },

      error: () => {

        this.errorMessage.set(
          'Não foi possível carregar os grupos de empresas.'
        );

        this.loading.set(false);
      }
    });
  }


  private loadGroups(): void {

    this.groupService
      .list()
      .subscribe({

        next: groups => {

          this.groups.set(
            groups
          );

          this.ensureValidPage();
        },

        error: () => {

          this.snackBar.open(
            'Não foi possível atualizar a lista de grupos.',
            'Fechar',
            {
              duration: 4000
            }
          );
        }
      });
  }


  /* =========================================================
     BUSCA
     ========================================================= */

  setSearch(
    value: string
  ): void {

    this.searchTerm.set(
      value
    );

    this.pageIndex.set(
      0
    );
  }


  setCompanySearch(
    value: string
  ): void {

    this.companySearchTerm.set(
      value
    );
  }


  /* =========================================================
     PAGINAÇÃO
     ========================================================= */

  onPage(
    event: PageEvent
  ): void {

    this.pageIndex.set(
      event.pageIndex
    );

    this.pageSize.set(
      event.pageSize
    );
  }


  private ensureValidPage(): void {

    const total =
      this.filteredGroups()
        .length;

    const maxPageIndex =
      Math.max(
        0,
        Math.ceil(
          total /
          this.pageSize()
        ) - 1
      );

    if (
      this.pageIndex() >
      maxPageIndex
    ) {

      this.pageIndex.set(
        maxPageIndex
      );
    }
  }


  /* =========================================================
     CRIAR
     ========================================================= */

  openCreate(): void {

    this.editorMode.set(
      'create'
    );

    this.editingGroup.set(
      null
    );

    this.groupForm.reset({
      name: ''
    });

    this.companySearchTerm.set(
      ''
    );

    this.selectedCompanyIds.set(
      new Set()
    );
  }


  /* =========================================================
     EDITAR
     ========================================================= */

  openEdit(
    group: CompanyGroup
  ): void {

    this.editorMode.set(
      'edit'
    );

    this.editingGroup.set(
      group
    );

    this.groupForm.reset({
      name: group.name
    });

    this.companySearchTerm.set(
      ''
    );

    this.selectedCompanyIds.set(
      new Set()
    );

    this.loadingGroup.set(
      true
    );

    this.groupService
      .get(group.id)
      .subscribe({

        next: detail => {

          this.editingGroup.set(
            detail
          );

          this.groupForm.reset({
            name: detail.name
          });

          this.selectedCompanyIds.set(
            new Set(
              detail.company_ids ?? []
            )
          );

          this.loadingGroup.set(
            false
          );
        },

        error: error => {

          this.loadingGroup.set(
            false
          );

          this.snackBar.open(
            this.apiErrorMessage(
              error,
              'Não foi possível carregar o grupo.'
            ),
            'Fechar',
            {
              duration: 4500
            }
          );

          this.closeEditor();
        }
      });
  }


  /* =========================================================
     FECHAR
     ========================================================= */

  closeEditor(): void {

    if (
      this.saving()
    ) {
      return;
    }

    this.editorMode.set(
      null
    );

    this.editingGroup.set(
      null
    );

    this.loadingGroup.set(
      false
    );

    this.groupForm.reset({
      name: ''
    });

    this.companySearchTerm.set(
      ''
    );

    this.selectedCompanyIds.set(
      new Set()
    );
  }


  /* =========================================================
     SELEÇÃO DE EMPRESAS
     ========================================================= */

  isCompanySelected(
    companyId: string
  ): boolean {

    return this
      .selectedCompanyIds()
      .has(companyId);
  }


  toggleCompany(
    companyId: string,
    checked: boolean
  ): void {

    const selected =
      new Set(
        this.selectedCompanyIds()
      );

    if (checked) {

      selected.add(
        companyId
      );

    } else {

      selected.delete(
        companyId
      );
    }

    this.selectedCompanyIds.set(
      selected
    );
  }


  toggleAllVisible(): void {

    const visible =
      this.filteredCompanies();

    const selected =
      new Set(
        this.selectedCompanyIds()
      );

    if (
      this.allVisibleSelected()
    ) {

      visible.forEach(
        company =>
          selected.delete(
            company.id
          )
      );

    } else {

      visible.forEach(
        company =>
          selected.add(
            company.id
          )
      );
    }

    this.selectedCompanyIds.set(
      selected
    );
  }


  clearSelection(): void {

    this.selectedCompanyIds.set(
      new Set()
    );
  }


  /* =========================================================
     SALVAR
     ========================================================= */

  saveGroup(): void {

    if (
      this.groupForm.invalid
    ) {

      this.groupForm
        .markAllAsTouched();

      this.snackBar.open(
        'Informe o nome do grupo.',
        'Fechar',
        {
          duration: 3500
        }
      );

      return;
    }

    const payload =
      this.buildPayload();

    const current =
      this.editingGroup();

    this.saving.set(
      true
    );

    const request =
      this.editorMode() ===
        'edit' &&
      current

        ? this.groupService
            .update(
              current.id,
              payload
            )

        : this.groupService
            .create(
              payload
            );

    request.subscribe({

      next: () => {

        this.saving.set(
          false
        );

        this.snackBar.open(

          this.editorMode() ===
            'create'

            ? 'Grupo criado com sucesso.'

            : 'Grupo atualizado com sucesso.',

          'Fechar',

          {
            duration: 3000
          }
        );

        this.closeEditor();

        this.loadGroups();
      },

      error: error => {

        this.saving.set(
          false
        );

        this.snackBar.open(
          this.apiErrorMessage(
            error,
            'Não foi possível salvar o grupo.'
          ),
          'Fechar',
          {
            duration: 5000
          }
        );
      }
    });
  }


  private buildPayload():
    CompanyGroupPayload {

    const value =
      this.groupForm
        .getRawValue();

    return {

      name:
        value.name.trim(),

      company_ids:
        Array.from(
          this.selectedCompanyIds()
        )
    };
  }


  /* =========================================================
     HELPERS
     ========================================================= */

  formatCnpj(
    value: string | null
  ): string {

    if (!value) {
      return '—';
    }

    const digits =
      value.replace(
        /\D/g,
        ''
      );

    if (
      digits.length !== 14
    ) {
      return value;
    }

    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }


  private normalizeText(
    value: string
  ): string {

    return (
      value ?? ''
    )
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
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

      return errors.join(
        ' '
      );
    }

    return (
      error?.error?.error ??
      fallback
    );
  }
}