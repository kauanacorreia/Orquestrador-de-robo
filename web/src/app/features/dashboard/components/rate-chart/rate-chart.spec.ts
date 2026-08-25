import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { RatePoint } from '../../models/dashboard.model';
import { RateChart } from './rate-chart';

describe('RateChart', () => {
  let component: RateChart;
  let fixture: ComponentFixture<RateChart>;

  const data: RatePoint[] = [
    { date: '2026-08-17', rate: 0.9 },
    { date: '2026-08-18', rate: 0.944 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateChart],
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    fixture = TestBed.createComponent(RateChart);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Taxa de sucesso');
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps the rate series into daily labels and percentage values', () => {
    expect(component.chartData().labels).toEqual(['17/08', '18/08']);
    expect(component.chartData().datasets[0].data).toEqual([90, 94.4]);
    expect(component.chartData().datasets[0].label).toBe('Taxa de sucesso');
  });
});
