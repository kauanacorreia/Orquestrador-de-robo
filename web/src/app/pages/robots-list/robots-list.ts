import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RobotService } from '../../core/services/robot.service';
import { Robot } from '../../core/models/robot.model';
import { SchemaEditorDialog, SchemaEditorData } from './schema-editor-dialog/schema-editor-dialog';
import { EditLogDialog, EditLogDialogData } from './edit-log-dialog/edit-log-dialog';

const CATEGORY_PALETTE: Record<string, string> = {
  fiscal: '#ff5c00',
  comercial: '#004fdf',
  'contábil': '#0f9d6c',
  contabil: '#0f9d6c',
  rh: '#7c5cff',
  ti: '#0891b2',
};

type ViewMode = 'grid' | 'table';
type SortBy = 'name' | 'department';
type StatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'app-robots-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './robots-list.html',
  styleUrl: './robots-list.scss'
})
export class RobotsList implements OnInit {

  private readonly robotService = inject(RobotService);
  private readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  robots = signal<Robot[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  searchTerm = signal('');
  viewMode = signal<ViewMode>('grid');
  sortBy = signal<SortBy>('name');
  statusFilter = signal<StatusFilter>('ACTIVE');
  departmentFilter = signal<string>('ALL');

  pageIndex = signal(0);
  pageSize = signal(9);

  tableColumns = ['name', 'department', 'status', 'actions'];

  departments = computed(() => {
    const set = new Set<string>();
    this.robots().forEach(r => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  });

  filteredRobots = computed(() => {
    const term = normalize(this.searchTerm().trim());
    const status = this.statusFilter();
    const department = this.departmentFilter();

    let list = this.robots();

    if (status !== 'ALL') {
      list = list.filter(r => r.status === status);
    }

    if (department !== 'ALL') {
      list = list.filter(r => r.department === department);
    }

    if (term) {
      list = list.filter(r =>
        normalize(r.name).includes(term) ||
        normalize(r.description ?? '').includes(term)
      );
    }

    const sorted = [...list];
    if (this.sortBy() === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => {
        const deptCompare = (a.department ?? '').localeCompare(b.department ?? '');
        return deptCompare !== 0 ? deptCompare : a.name.localeCompare(b.name);
      });
    }

    return sorted;
  });

  groupedByDepartment = computed(() => {
    const groups = new Map<string, Robot[]>();
    this.filteredRobots().forEach(r => {
      const key = r.department || 'Sem departamento';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    });
    return Array.from(groups.entries()).map(([department, robots]) => ({ department, robots }));
  });

  pagedRobotsForTable = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredRobots().slice(start, start + this.pageSize());
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

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.pageIndex.set(0);
  }

  categoryColor(robot: Robot): string {
    const key = (robot.department ?? '').toLowerCase();
    return CATEGORY_PALETTE[key] ?? '#6b7280';
  }

  openCreate(): void {
    this.openDialog({ mode: 'create' });
  }

  openEdit(robot: Robot): void {
    this.openDialog({ mode: 'edit', robot });
  }

  openHistory(robot: Robot): void {
    this.dialog.open<EditLogDialog, EditLogDialogData>(EditLogDialog, {
      data: { robot },
      width: '520px'
    });
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