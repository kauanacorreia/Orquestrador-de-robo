import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DashboardFilters } from '../../models/dashboard.model';
import { defaultDashboardFilters } from '../../utils/period.util';
import { DashboardFiltersPanel } from './dashboard-filters';

describe('DashboardFiltersPanel', () => {
  let component: DashboardFiltersPanel;
  let fixture: ComponentFixture<DashboardFiltersPanel>;
  let filters: DashboardFilters;

  beforeEach(async () => {
    filters = defaultDashboardFilters(new Date('2026-08-24T12:00:00.000Z'));

    await TestBed.configureTestingModule({
      imports: [DashboardFiltersPanel, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFiltersPanel);
    component = fixture.componentInstance;
    component.filters = filters;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits an updated period range when a preset changes', () => {
    const emitted: DashboardFilters[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.onPeriodPresetChange('30d');

    expect(emitted[0].periodPreset).toBe('30d');
    expect(emitted[0].startDate).not.toBe(filters.startDate);
  });

  it('emits the selected robot ids', () => {
    const emitted: DashboardFilters[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.onRobotsChange(['robot-faturamento']);

    expect(emitted[0].robotIds).toEqual(['robot-faturamento']);
  });

  it('resets to the default filters on clear', () => {
    const emitted: DashboardFilters[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component.onStatusesChange(['failure']);
    component.clearFilters();

    expect(emitted[1].statuses).toEqual([]);
    expect(emitted[1].periodPreset).toBe('7d');
  });
});
