import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { RobotService } from '../../core/services/robot.service';
import { Robot } from '../../core/models/robot.model';
import { SchemaEditorDialog, SchemaEditorData } from './schema-editor-dialog/schema-editor-dialog';

const CATEGORY_PALETTE: Record<string, string> = {
  fiscal: '#ff5c00',
  comercial: '#004fdf',
  contábil: '#0f9d6c',
  contabil: '#0f9d6c',
  rh: '#7c5cff',
  ti: '#0891b2',
};

@Component({
  selector: 'app-robots-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './robots-list.html',
  styleUrl: './robots-list.scss'
})
export class RobotsList implements OnInit {

  private readonly robotService = inject(RobotService);
  private readonly dialog = inject(MatDialog);

  robots = signal<Robot[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  searchTerm = signal('');

  filteredRobots = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.robots();
    return this.robots().filter(r =>
      r.name.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term)
    );
  });

  activeCount = computed(() =>
    this.robots().filter(r => r.status === 'ACTIVE').length
  );

  ngOnInit(): void {
    this.loadRobots();
  }

  loadRobots(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.robotService.list().subscribe({
      next: (robots) => {
        this.robots.set(robots);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('A lista de robôs não carregou. Verifique a conexão com a API e tente novamente.');
        this.loading.set(false);
      }
    });
  }

  fieldCount(robot: Robot): number {
    return robot.schema?.fields?.length ?? 0;
  }

  category(robot: Robot): string {
    const match = robot.name.match(/Robô\s+([\wÀ-ú]+)/i);
    return match ? match[1] : 'Geral';
  }

  categoryColor(robot: Robot): string {
    const key = this.category(robot).toLowerCase();
    return CATEGORY_PALETTE[key] ?? '#6b7280';
  }

  openCreate(): void {
    this.openDialog({ mode: 'create' });
  }

  openView(robot: Robot): void {
    this.openDialog({ mode: 'view', robot });
  }

  openNewVersion(robot: Robot): void {
    this.openDialog({ mode: 'new-version', robot });
  }

  private openDialog(data: SchemaEditorData): void {
    const ref = this.dialog.open(SchemaEditorDialog, {
      data,
      width: '680px'
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRobots();
      }
    });
  }
}