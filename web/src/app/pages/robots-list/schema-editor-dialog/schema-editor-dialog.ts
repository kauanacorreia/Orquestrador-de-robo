import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { RobotService } from '../../../core/services/robot.service';
import { AuthService } from '../../../core/services/auth.service';
import { Robot, RobotField } from '../../../core/models/robot.model';

export interface SchemaEditorData {
  mode: 'create' | 'edit';
  robot?: Robot;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'password', label: 'Senha' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'boolean', label: 'Sim/Não' }
];

const DEFAULT_FIELDS: RobotField[] = [
  { name: 'codigo', label: 'Código', type: 'text', required: true },
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'pasta_empresa', label: 'Pasta Empresa', type: 'text', required: true },
  { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
  { name: 'inscricao_estadual', label: 'Inscrição Estadual', type: 'text', required: false },
  { name: 'regime_tributario', label: 'Regime Tributário', type: 'text', required: true },
  { name: 'optante', label: 'Optante (Simples Nacional)', type: 'boolean', required: false },
  { name: 'pispasep', label: 'PIS/PASEP', type: 'text', required: false },
  { name: 'variacao_monetaria', label: 'Variação Monetária', type: 'text', required: false },
  { name: 'numero_conta', label: 'Número da Conta', type: 'text', required: false },
  { name: 'senha', label: 'Senha', type: 'password', required: true },
  { name: 'frase_secreta', label: 'Frase Secreta', type: 'password', required: true },
];

const DEFAULT_FIELD_NAMES = new Set(DEFAULT_FIELDS.map(f => f.name));

@Component({
  selector: 'app-schema-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './schema-editor-dialog.html',
  styleUrl: './schema-editor-dialog.scss'
})
export class SchemaEditorDialog {

  private readonly formBuilder = inject(FormBuilder);
  private readonly robotService = inject(RobotService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<SchemaEditorDialog>);
  readonly data = inject<SchemaEditorData>(MAT_DIALOG_DATA);

  fieldTypes = FIELD_TYPES;
  saving = false;
  toggling = false;
  errorMessage = '';

  status = signal(this.data.robot?.status ?? 'ACTIVE');

  private readonly initialFields: RobotField[] =
    this.data.robot?.schema?.fields ??
    (this.data.mode === 'create' ? DEFAULT_FIELDS : []);

  private readonly initialDefaultFields = this.initialFields.filter(f => DEFAULT_FIELD_NAMES.has(f.name));
  private readonly initialCustomFields = this.initialFields.filter(f => !DEFAULT_FIELD_NAMES.has(f.name));

  form = this.formBuilder.nonNullable.group({
    name: [this.data.robot?.name ?? '', Validators.required],
    description: [this.data.robot?.description ?? '', Validators.required],
    department: [this.data.robot?.department ?? '', Validators.required],
    defaultFields: this.formBuilder.array(
      this.initialDefaultFields.map(f => this.buildFieldGroup(f))
    ),
    customFields: this.formBuilder.array(
      this.initialCustomFields.map(f => this.buildFieldGroup(f))
    )
  });

  get defaultFields(): FormArray {
    return this.form.get('defaultFields') as FormArray;
  }

  get customFields(): FormArray {
    return this.form.get('customFields') as FormArray;
  }

  buildFieldGroup(field?: RobotField): FormGroup {
    return this.formBuilder.nonNullable.group({
      name: [field?.name ?? '', Validators.required],
      label: [field?.label ?? ''],
      type: [field?.type ?? 'text', Validators.required],
      required: [field?.required ?? true]
    });
  }

  addCustomField(): void {
    this.customFields.push(this.buildFieldGroup());
  }

  removeCustomField(index: number): void {
    this.customFields.removeAt(index);
  }

  toggleStatus(): void {
    if (!this.data.robot) return;
    this.toggling = true;

    this.authService.getCurrentUserId().then(userId => {
      this.robotService.toggleStatus(this.data.robot!.id, userId).subscribe({
        next: (robot) => {
          this.status.set(robot.status);
          this.toggling = false;
        },
        error: () => {
          this.toggling = false;
          this.errorMessage = 'Não foi possível alterar o status do robô.';
        }
      });
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const allFields = [
      ...(this.defaultFields.getRawValue() as RobotField[]),
      ...(this.customFields.getRawValue() as RobotField[])
    ];

    if (allFields.length === 0) {
      this.errorMessage = 'Adicione ao menos um campo.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const { name, description, department } = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.robotService.create(name, description, department, { fields: allFields }).subscribe({
        next: (robot) => {
          this.saving = false;
          this.dialogRef.close(robot);
        },
        error: () => {
          this.saving = false;
          this.errorMessage = 'Não foi possível registrar o robô.';
        }
      });
    } else {
      this.authService.getCurrentUserId().then(userId => {
        this.robotService.update(
          this.data.robot!.id,
          { name, description, department, schema: { fields: allFields } },
          userId
        ).subscribe({
          next: (robot) => {
            this.saving = false;
            this.dialogRef.close(robot);
          },
          error: () => {
            this.saving = false;
            this.errorMessage = 'Não foi possível salvar as alterações.';
          }
        });
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}