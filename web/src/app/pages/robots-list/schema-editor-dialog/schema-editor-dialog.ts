import { Component, inject } from '@angular/core';
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

import { RobotService } from '../../../core/services/robot.service';
import { Robot, RobotField } from '../../../core/models/robot.model';

export interface SchemaEditorData {
  mode: 'create' | 'new-version' | 'view';
  robot?: Robot;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'password', label: 'Senha' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'boolean', label: 'Sim/Não' }
];

// Campos padrão que toda empresa cadastrada precisa ter no robô.
// Continuam editáveis e removíveis — isso só define o ponto de partida.
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
    MatTooltipModule
  ],
  templateUrl: './schema-editor-dialog.html',
  styleUrl: './schema-editor-dialog.scss'
})
export class SchemaEditorDialog {

  private readonly formBuilder = inject(FormBuilder);
  private readonly robotService = inject(RobotService);
  private readonly dialogRef = inject(MatDialogRef<SchemaEditorDialog>);
  readonly data = inject<SchemaEditorData>(MAT_DIALOG_DATA);

  fieldTypes = FIELD_TYPES;
  saving = false;
  errorMessage = '';

  readOnly = this.data.mode === 'view';

  private readonly initialFields: RobotField[] =
    this.data.robot?.schema?.fields ??
    (this.data.mode === 'create' ? DEFAULT_FIELDS : []);

  form = this.formBuilder.nonNullable.group({
    name: [this.data.robot?.name ?? '', Validators.required],
    description: [this.data.robot?.description ?? '', Validators.required],
    fields: this.formBuilder.array(
      this.initialFields.map(f => this.buildFieldGroup(f))
    )
  });

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  buildFieldGroup(field?: RobotField): FormGroup {
    return this.formBuilder.nonNullable.group({
      name: [field?.name ?? '', Validators.required],
      label: [field?.label ?? ''],
      type: [field?.type ?? 'text', Validators.required],
      required: [field?.required ?? true]
    });
  }

  isDefaultField(index: number): boolean {
    const name = this.fields.at(index).get('name')?.value;
    return DEFAULT_FIELD_NAMES.has(name);
  }

  addField(): void {
    this.fields.push(this.buildFieldGroup());
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  save(): void {
    if (this.data.mode === 'new-version') {
      this.saveNewVersion();
      return;
    }
    this.saveNewRobot();
  }

  private saveNewRobot(): void {
    if (this.form.invalid || this.fields.length === 0) {
      this.form.markAllAsTouched();
      this.errorMessage = this.fields.length === 0 ? 'Adicione ao menos um campo.' : '';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const { name, description, fields } = this.form.getRawValue();

    this.robotService.create(name, description, { fields: fields as RobotField[] }).subscribe({
      next: (robot) => {
        this.saving = false;
        this.dialogRef.close(robot);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Não foi possível registrar o robô.';
      }
    });
  }

  private saveNewVersion(): void {
    if (this.fields.length === 0) {
      this.errorMessage = 'Adicione ao menos um campo.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const { fields } = this.form.getRawValue();
    const robotId = this.data.robot!.id;

    this.robotService.newVersion(robotId, { fields: fields as RobotField[] }).subscribe({
      next: (robot) => {
        this.saving = false;
        this.dialogRef.close(robot);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Não foi possível criar a nova versão.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}