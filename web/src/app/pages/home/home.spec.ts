import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { DashboardStore } from '../../features/dashboard/services/dashboard-store.service';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let store: DashboardStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    store = TestBed.inject(DashboardStore);
    spyOn(store, 'loadDashboard');
    spyOn(store, 'loadFilterOptions');
    spyOn(store, 'startLogPolling');
    spyOn(store, 'stopLogPolling');

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('loads the dashboard, the filter options and starts log polling on init', () => {
    fixture.detectChanges();

    expect(store.loadDashboard).toHaveBeenCalled();
    expect(store.loadFilterOptions).toHaveBeenCalled();
    expect(store.startLogPolling).toHaveBeenCalled();
  });

  it('stops log polling on destroy', () => {
    fixture.detectChanges();
    fixture.destroy();

    expect(store.stopLogPolling).toHaveBeenCalled();
  });
});
