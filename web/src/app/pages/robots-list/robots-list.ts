import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { RobotService } from '../../core/services/robot.service';
import { Robot } from '../../core/models/robot.model';
import {
  SchemaEditorDialog,
  SchemaEditorData
} from './schema-editor-dialog/schema-editor-dialog';
import {
  EditLogDialog,
  EditLogDialogData
} from './edit-log-dialog/edit-log-dialog';

const CATEGORY_PALETTE: Record<string, string> = {
  fiscal: '#ff5c00',
  comercial: '#004fdf',
  'contábil': '#0f9d6c',
  contabil: '#0f9d6c',
  rh: '#7c5cff',
  ti: '#0891b2'
};

type ViewMode = 'grid' | 'table';
type StatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';
type SortColumn = 'name' | 'department' | 'status';
type SortDirection = 'asc' | 'desc';

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
    MatTooltipModule,
    MatMenuModule,
    MatExpansionModule,
    MatCheckboxModule
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
  viewMode = signal<ViewMode>('grid');
  statusFilter = signal<StatusFilter>('ACTIVE');

  selectedDepartments = signal<Set<string>>(new Set());
  groupByDepartment = signal(false);

  pageIndex = signal(0);
  pageSize = signal(9);

  tableSortColumn = signal<SortColumn>('name');
  tableSortDirection = signal<SortDirection>('asc');

  tableColumns = ['name', 'department', 'status', 'actions'];

  departments = computed(() => {
    const set = new Set<string>();

    this.robots().forEach(robot => {
      if (robot.department) {
        set.add(robot.department);
      }
    });

    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
  });

  departmentFilterLabel = computed(() => {
    const selected = this.selectedDepartments();

    if (selected.size === 0) {
      return 'Departamentos';
    }

    if (selected.size === 1) {
      return Array.from(selected)[0];
    }

    return `${selected.size} departamentos`;
  });

  filteredRobots = computed(() => {
    const term = normalize(this.searchTerm().trim());
    const status = this.statusFilter();
    const selectedDepartments = this.selectedDepartments();

    let list = this.robots();

    if (status !== 'ALL') {
      list = list.filter(robot => robot.status === status);
    }

    if (selectedDepartments.size > 0) {
      list = list.filter(
        robot =>
          !!robot.department && selectedDepartments.has(robot.department)
      );
    }

    if (term) {
      list = list.filter(robot =>
        normalize(robot.name).includes(term) ||
        normalize(robot.description ?? '').includes(term) ||
        normalize(robot.department ?? '').includes(term)
      );
    }

    const sorted = [...list];

    if (this.groupByDepartment()) {
      sorted.sort((a, b) => {
        const departmentCompare = (a.department ?? '').localeCompare(
          b.department ?? '',
          'pt-BR',
          { sensitivity: 'base' }
        );

        if (departmentCompare !== 0) {
          return departmentCompare;
        }

        return a.name.localeCompare(b.name, 'pt-BR', {
          sensitivity: 'base'
        });
      });
    } else {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      );
    }

    return sorted;
  });

  sortedRobotsForTable = computed(() => {
    const column = this.tableSortColumn();
    const direction = this.tableSortDirection();

    return [...this.filteredRobots()].sort((a, b) => {
      const valueA = this.getSortValue(a, column);
      const valueB = this.getSortValue(b, column);

      const comparison = valueA.localeCompare(valueB, 'pt-BR', {
        sensitivity: 'base'
      });

      return direction === 'asc' ? comparison : -comparison;
    });
  });

  groupedByDepartment = computed(() => {
    const groups = new Map<string, Robot[]>();

    this.filteredRobots().forEach(robot => {
      const key = robot.department || 'Sem departamento';

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(robot);
    });

    return Array.from(groups.entries()).map(([department, robots]) => ({
      department,
      robots
    }));
  });

  pagedRobotsForTable = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();

    return this.sortedRobotsForTable().slice(start, end);
  });

  activeCount = computed(() =>
    this.robots().filter(robot => robot.status === 'ACTIVE').length
  );

  ngOnInit(): void {
    this.loadRobots();
  }

  loadRobots(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.robotService.list().subscribe({
      next: robots => {
        this.robots.set(robots);
        this.ensureValidPage();
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'A lista de robôs não carregou. Verifique a conexão com a API e tente novamente.'
        );
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.resetPagination();
  }

  onStatusChange(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.resetPagination();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.ensureValidPage();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.resetPagination();
  }

  isDepartmentSelected(department: string): boolean {
    return this.selectedDepartments().has(department);
  }

  toggleDepartment(department: string): void {
    const current = new Set(this.selectedDepartments());

    if (current.has(department)) {
      current.delete(department);
    } else {
      current.add(department);
    }

    this.selectedDepartments.set(current);
    this.resetPagination();
  }

  clearDepartments(): void {
    this.selectedDepartments.set(new Set());
    this.resetPagination();
  }

  toggleGroupByDepartment(): void {
    this.groupByDepartment.update(value => !value);
    this.resetPagination();
  }

  toggleTableSort(column: SortColumn): void {
    if (this.tableSortColumn() === column) {
      this.tableSortDirection.update(direction =>
        direction === 'asc' ? 'desc' : 'asc'
      );
    } else {
      this.tableSortColumn.set(column);
      this.tableSortDirection.set('asc');
    }

    this.resetPagination();
  }

  sortIcon(column: SortColumn): string {
    if (this.tableSortColumn() !== column) {
      return 'unfold_more';
    }

    return this.tableSortDirection() === 'asc'
      ? 'arrow_upward'
      : 'arrow_downward';
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
      width: '520px',
      maxWidth: '95vw'
    });
  }

  private getSortValue(robot: Robot, column: SortColumn): string {
    switch (column) {
      case 'department':
        return robot.department ?? '';
      case 'status':
        return robot.status ?? '';
      case 'name':
      default:
        return robot.name ?? '';
    }
  }

  private resetPagination(): void {
    this.pageIndex.set(0);
  }

  private ensureValidPage(): void {
    const total = this.filteredRobots().length;
    const size = this.pageSize();

    if (total === 0) {
      this.pageIndex.set(0);
      return;
    }

    const lastPageIndex = Math.max(Math.ceil(total / size) - 1, 0);

    if (this.pageIndex() > lastPageIndex) {
      this.pageIndex.set(lastPageIndex);
    }
  }

  private openDialog(data: SchemaEditorData): void {
    const ref = this.dialog.open(SchemaEditorDialog, {
      data,
      width: '680px',
      maxWidth: '95vw'
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadRobots();
      }
    });
  }
}
