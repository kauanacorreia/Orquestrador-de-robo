import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLog } from '../../models/dashboard.model';
import { ActivityTable } from './activity-table';

describe('ActivityTable', () => {
  let component: ActivityTable;
  let fixture: ComponentFixture<ActivityTable>;

  const logs: ActivityLog[] = [
    {
      id: '1',
      timestamp: '2026-08-17T10:32:00.000Z',
      robotId: 'robot-simpliss',
      robotName: 'Robô Simpliss',
      clientId: 'client-simpliss',
      clientName: 'Simpliss',
      userId: 'user-ana',
      userName: 'Ana Ribeiro',
      status: 'started',
      step: 'Importação',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('logs', logs);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a table row per log with robot name and step', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.activity-table__table')).toBeTruthy();
    expect(element.textContent).toContain('Robô Simpliss');
    expect(element.textContent).toContain('Importação');
    expect(element.textContent).toContain('Em execução');
  });

  it('shows the empty state when there are no logs', () => {
    fixture.componentRef.setInput('logs', []);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.activity-table__empty')).toBeTruthy();
  });
});
