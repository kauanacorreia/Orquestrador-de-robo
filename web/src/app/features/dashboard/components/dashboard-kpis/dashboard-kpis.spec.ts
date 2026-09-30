import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DashboardSummary } from '../../models/dashboard.model';
import { DashboardKpis } from './dashboard-kpis';

describe('DashboardKpis', () => {
  let component: DashboardKpis;
  let fixture: ComponentFixture<DashboardKpis>;
  let summary: DashboardSummary;

  beforeEach(async () => {
    summary = {
      totalExecutions: 10,
      successCount: 8,
      successRate: 0.8,
      failureCount: 2,
      failureRate: 0.2,
      failuresLast24h: 1,
      failuresLast24hRate: 0.1,
      activeRobots: 3,
      activeUsers: 4,
      clients: 5,
      criticalRobot: null,
    };

    await TestBed.configureTestingModule({
      imports: [DashboardKpis, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardKpis);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('summary', summary);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the success KPI card', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Automações com sucesso');
  });
});
