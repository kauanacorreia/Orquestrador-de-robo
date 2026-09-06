import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { RobotService } from '../../../core/services/robot.service';
import {
  Robot,
  RobotEditLog
} from '../../../core/models/robot.model';

export interface EditLogDialogData {
  robot: Robot;
}

interface SchemaFieldValue {
  name?: string;
  label?: string;
  type?: string;
  required?: boolean;
}

@Component({
  selector: 'app-edit-log-dialog',
  standalone: true,

  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],

  templateUrl: './edit-log-dialog.html',
  styleUrl: './edit-log-dialog.scss'
})
export class EditLogDialog {

  private readonly robotService = inject(RobotService);

  private readonly dialogRef =
    inject(MatDialogRef<EditLogDialog>);

  readonly data =
    inject<EditLogDialogData>(MAT_DIALOG_DATA);

  logs = signal<RobotEditLog[]>([]);

  loading = signal(true);

  errorMessage = signal('');

  constructor() {
    this.load();
  }

  load(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.robotService
      .editLogs(this.data.robot.id)
      .subscribe({

        next: (logs) => {
          this.logs.set(logs);
          this.loading.set(false);
        },

        error: () => {
          this.errorMessage.set(
            'Não foi possível carregar o histórico.'
          );

          this.loading.set(false);
        }

      });
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Converte nomes internos para nomes amigáveis.
   */
  fieldLabel(fieldName: string): string {

    const labels: Record<string, string> = {
      name: 'Nome',
      description: 'Descrição',
      department: 'Departamento',
      status: 'Status'
    };

    if (labels[fieldName]) {
      return labels[fieldName];
    }

    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      );
  }

  /**
   * Verifica se o valor salvo no histórico representa
   * um campo do schema do robô.
   */
  isSchemaValue(value: string | null | undefined): boolean {

    const parsed = this.parseSchemaValue(value);

    if (!parsed) {
      return false;
    }

    return !!(
      parsed.name ||
      parsed.label ||
      parsed.type ||
      parsed.required !== undefined
    );
  }

  /**
   * Considera alteração de schema quando o valor antigo
   * ou o novo for um objeto de campo.
   */
  isSchemaChange(log: RobotEditLog): boolean {
    return (
      this.isSchemaValue(log.old_value) ||
      this.isSchemaValue(log.new_value)
    );
  }

  /**
   * Converte o JSON armazenado no log em objeto.
   */
  parseSchemaValue(
    value: string | null | undefined
  ): SchemaFieldValue | null {

    if (!value) {
      return null;
    }

    try {

      const parsed = JSON.parse(value);

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed as SchemaFieldValue;
      }

      return null;

    } catch {

      return null;

    }
  }

  /**
   * Retorna o rótulo de um campo salvo como JSON.
   */
  schemaLabel(
    value: string | null | undefined
  ): string {

    const field = this.parseSchemaValue(value);

    return (
      field?.label ||
      field?.name ||
      '(campo removido)'
    );
  }

  schemaName(
    value: string | null | undefined
  ): string {

    const field = this.parseSchemaValue(value);

    return field?.name || '—';
  }

  schemaType(
    value: string | null | undefined
  ): string {

    const field = this.parseSchemaValue(value);

    if (!field?.type) {
      return '—';
    }

    const types: Record<string, string> = {
      text: 'Texto',
      number: 'Número',
      date: 'Data',
      boolean: 'Sim/Não',
      select: 'Seleção',
      password: 'Senha',
      email: 'E-mail',
      textarea: 'Texto longo'
    };

    return types[field.type] || field.type;
  }

  schemaRequired(
    value: string | null | undefined
  ): string {

    const field = this.parseSchemaValue(value);

    if (!field) {
      return '—';
    }

    return field.required
      ? 'Sim'
      : 'Não';
  }

  /**
   * Exibição amigável para valores simples,
   * como status, departamento etc.
   */
  simpleValue(
    value: string | null | undefined
  ): string {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '(vazio)';
    }

    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo'
    };

    return labels[value] || value;
  }
}