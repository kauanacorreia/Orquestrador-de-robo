import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { VolumetriaPoint } from '../../models/dashboard.model';
import { VolumetriaChart } from './volumetria-chart';

describe('VolumetriaChart', () => {
  let component: VolumetriaChart;
  let fixture: ComponentFixture<VolumetriaChart>;

  const data: VolumetriaPoint[] = [
    { date: '2026-08-17', executions: 10, success: 8, failure: 2 },
    { date: '2026-08-18', executions: 15, success: 13, failure: 2 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumetriaChart],
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    fixture = TestBed.createComponent(VolumetriaChart);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps the input data into daily labels and stacked success/failure datasets', () => {
    expect(component.chartData().labels).toEqual(['17/08', '18/08']);
    expect(component.chartData().datasets[0].label).toBe('Sucesso');
    expect(component.chartData().datasets[0].data).toEqual([8, 13]);
    expect(component.chartData().datasets[1].label).toBe('Falha');
    expect(component.chartData().datasets[1].data).toEqual([2, 2]);
  });
});
