import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';

import {
  AccessControlService
} from '../../features/access-control/services/access-control.service';

import {
  AccessRole,
  AccessStatus,
  AccessUser,
  CreateUserPayload
} from '../../features/access-control/models/access-user.model';

type EditorMode =
  | 'create'
  | 'permissions'
  | null;

@Component({
  selector: 'app-access-control',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
  ],

  templateUrl: './access-control.html',
  styleUrl: './access-control.scss'
})
export class AccessControl {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly service =
    inject(AccessControlService);

  private readonly authService =
    inject(AuthService);

  private readonly snackBar =
    inject(MatSnackBar);

  users =
    signal<AccessUser[]>([]);

  loading =
    signal(true);

  saving =
    signal(false);

  errorMessage =
    signal('');

  searchTerm =
    signal('');

  editorMode =
    signal<EditorMode>(null);

  selectedUser =
    signal<AccessUser | null>(null);

  panelReady =
    signal(false);

  currentUserId =
    signal<string | null>(null);

  statusChangingUserId =
    signal<string | null>(null);

  createUserForm =
    this.formBuilder.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      passwordConfirmation: [
        '',
        [
          Validators.required
        ]
      ],

      role: [
        'OPERATOR' as AccessRole,
        [
          Validators.required
        ]
      ]
    });

  permissionsForm =
    this.formBuilder.nonNullable.group({
      role: [
        'OPERATOR' as AccessRole,
        [
          Validators.required
        ]
      ]
    });

  filteredUsers =
    computed(() => {
      const term =
        this.normalize(
          this.searchTerm()
        );

      const users =
        [...this.users()];

      if (!term) {
        return users;
      }

      return users.filter(user => {
        const name =
          this.normalize(
            user.name
          );

        const email =
          this.normalize(
            user.email
          );

        const role =
          this.normalize(
            this.roleLabel(
              user.role
            )
          );

        const status =
          this.normalize(
            this.statusLabel(
              user.status
            )
          );

        return (
          name.includes(term) ||
          email.includes(term) ||
          role.includes(term) ||
          status.includes(term)
        );
      });
    });

  constructor() {
    this.loadCurrentUser();

    this.loadUsers();
  }

  private async loadCurrentUser():
    Promise<void> {

    const userId =
      await this.authService
        .getCurrentUserId();

    this.currentUserId.set(
      userId
    );
  }

  loadUsers(): void {
    this.loading.set(true);

    this.errorMessage.set('');

    this.service
      .listUsers()
      .subscribe({
        next: users => {
          this.users.set(
            users
          );

          this.loading.set(
            false
          );
        },

        error: error => {
          this.loading.set(
            false
          );

          this.errorMessage.set(
            this.extractError(
              error,
              'Não foi possível carregar os usuários.'
            )
          );
        }
      });
  }

  setSearch(
    value: string
  ): void {
    this.searchTerm.set(
      value
    );
  }

  openCreate(): void {
    this.selectedUser.set(
      null
    );

    this.createUserForm.reset({
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      role: 'OPERATOR'
    });

    this.panelReady.set(
      false
    );

    this.editorMode.set(
      'create'
    );

    setTimeout(() => {
      this.panelReady.set(
        true
      );
    }, 80);
  }

  openPermissions(
    user: AccessUser
  ): void {
    this.selectedUser.set(
      user
    );

    this.permissionsForm.reset({
      role: user.role
    });

    this.panelReady.set(
      false
    );

    this.editorMode.set(
      'permissions'
    );

    setTimeout(() => {
      this.panelReady.set(
        true
      );
    }, 80);
  }

  closeEditor(): void {
    if (this.saving()) {
      return;
    }

    this.panelReady.set(
      false
    );

    this.editorMode.set(
      null
    );

    this.selectedUser.set(
      null
    );
  }

  createUser(): void {
    if (
      this.createUserForm.invalid
    ) {
      this.createUserForm
        .markAllAsTouched();

      this.snackBar.open(
        'Preencha todos os campos obrigatórios corretamente.',
        'Fechar',
        {
          duration: 4000
        }
      );

      return;
    }

    const formValue =
      this.createUserForm
        .getRawValue();

    if (
      formValue.password !==
      formValue.passwordConfirmation
    ) {
      this.snackBar.open(
        'As senhas não coincidem.',
        'Fechar',
        {
          duration: 4000
        }
      );

      return;
    }

    const payload: CreateUserPayload = {
      name:
        formValue.name
          .trim(),

      email:
        formValue.email
          .trim()
          .toLowerCase(),

      password:
        formValue.password,

      role:
        formValue.role
    };

    this.saving.set(
      true
    );

    this.service
      .createUser(
        payload
      )
      .subscribe({
        next: user => {
          this.saving.set(
            false
          );

          this.users.update(
            users =>
              [
                ...users,
                user
              ].sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name,
                    'pt-BR'
                  )
              )
          );

          this.closeEditor();

          this.snackBar.open(
            'Usuário criado com sucesso.',
            'Fechar',
            {
              duration: 3500
            }
          );
        },

        error: error => {
          this.saving.set(
            false
          );

          this.snackBar.open(
            this.extractError(
              error,
              'Não foi possível criar o usuário.'
            ),
            'Fechar',
            {
              duration: 5000
            }
          );
        }
      });
  }

  savePermissions(): void {
    const user =
      this.selectedUser();

    if (
      !user ||
      this.permissionsForm.invalid
    ) {
      return;
    }

    const role =
      this.permissionsForm
        .getRawValue()
        .role;

    this.saving.set(
      true
    );

    this.service
      .updatePermissions(
        user.id,
        {
          role
        }
      )
      .subscribe({
        next: updatedUser => {
          this.saving.set(
            false
          );

          this.replaceUser(
            updatedUser
          );

          this.selectedUser.set(
            updatedUser
          );

          this.closeEditor();

          this.snackBar.open(
            'Permissões atualizadas com sucesso.',
            'Fechar',
            {
              duration: 3500
            }
          );
        },

        error: error => {
          this.saving.set(
            false
          );

          this.snackBar.open(
            this.extractError(
              error,
              'Não foi possível atualizar as permissões.'
            ),
            'Fechar',
            {
              duration: 5000
            }
          );
        }
      });
  }

  toggleUserStatus(
    user: AccessUser
  ): void {
    if (
      this.isCurrentUser(user) &&
      user.status === 'ACTIVE'
    ) {
      this.snackBar.open(
        'Você não pode desativar o seu próprio usuário.',
        'Fechar',
        {
          duration: 4000
        }
      );

      return;
    }

    this.statusChangingUserId.set(
      user.id
    );

    this.service
      .toggleStatus(
        user.id
      )
      .subscribe({
        next: updatedUser => {
          this.statusChangingUserId.set(
            null
          );

          this.replaceUser(
            updatedUser
          );

          if (
            this.selectedUser()?.id ===
            updatedUser.id
          ) {
            this.selectedUser.set(
              updatedUser
            );
          }

          const message =
            updatedUser.status === 'ACTIVE'
              ? 'Usuário ativado com sucesso.'
              : 'Usuário desativado com sucesso.';

          this.snackBar.open(
            message,
            'Fechar',
            {
              duration: 3500
            }
          );
        },

        error: error => {
          this.statusChangingUserId.set(
            null
          );

          this.snackBar.open(
            this.extractError(
              error,
              'Não foi possível alterar o status do usuário.'
            ),
            'Fechar',
            {
              duration: 5000
            }
          );
        }
      });
  }

  isCurrentUser(
    user: AccessUser
  ): boolean {
    return (
      user.id ===
      this.currentUserId()
    );
  }

  isChangingStatus(
    user: AccessUser
  ): boolean {
    return (
      this.statusChangingUserId() ===
      user.id
    );
  }

  roleLabel(
    role: AccessRole
  ): string {
    return (
      role === 'ADMIN'
        ? 'Admin'
        : 'Operador'
    );
  }

  statusLabel(
    status: AccessStatus
  ): string {
    return (
      status === 'ACTIVE'
        ? 'Ativo'
        : 'Inativo'
    );
  }

  formatLastLogin(
    value: string | null
  ): string {
    if (!value) {
      return 'Nunca acessou';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(date);
  }

  private replaceUser(
    updatedUser: AccessUser
  ): void {
    this.users.update(
      users =>
        users.map(
          user =>
            user.id ===
            updatedUser.id
              ? updatedUser
              : user
        )
    );
  }

  private normalize(
    value:
      string |
      null |
      undefined
  ): string {
    return (
      value ?? ''
    )
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim();
  }

  private extractError(
    error: unknown,
    fallback: string
  ): string {
    if (
      error instanceof
      HttpErrorResponse
    ) {
      const body =
        error.error;

      if (
        Array.isArray(
          body?.errors
        ) &&
        body.errors.length > 0
      ) {
        return body.errors.join(
          ' '
        );
      }

      if (
        typeof body?.error ===
        'string'
      ) {
        return body.error;
      }
    }

    if (
      error instanceof Error &&
      error.message
    ) {
      return error.message;
    }

    return fallback;
  }
}