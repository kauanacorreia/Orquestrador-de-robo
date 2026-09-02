import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCard } from './kpi-card';

describe('KpiCard', () => {
  let component: KpiCard;
  let fixture: ComponentFixture<KpiCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCard],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Usuários ativos');
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the label and value', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.kpi-card__label')?.textContent).toContain('Usuários ativos');
    expect(element.querySelector('.kpi-card__value')?.textContent).toContain('42');
  });

  it('applies the success variant class', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.kpi-card--success')).toBeTruthy();
  });

  it('applies the danger variant class', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.kpi-card--danger')).toBeTruthy();
  });

  it('applies the attention border class', () => {
    fixture.componentRef.setInput('attention', true);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.kpi-card--attention')).toBeTruthy();
  });

  it('renders the subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Últimos 7 dias');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.kpi-card__subtitle')?.textContent).toContain('Últimos 7 dias');
  });

  it('shows the raw value first and the secondary value muted by default', () => {
    fixture.componentRef.setInput('value', 1180);
    fixture.componentRef.setInput('secondaryValue', '94,4%');
    fixture.detectChanges();

    const values = fixture.nativeElement.querySelectorAll('.kpi-card__value');

    expect(values[0].textContent).toContain('1180');
    expect(values[1].textContent).toContain('94,4%');
    expect(values[1].classList).toContain('kpi-card__value--muted');
  });

  it('emphasizes the secondary value when emphasis is set to secondaryValue', () => {
    fixture.componentRef.setInput('value', 70);
    fixture.componentRef.setInput('secondaryValue', '5,6%');
    fixture.componentRef.setInput('emphasis', 'secondaryValue');
    fixture.detectChanges();

    const values = fixture.nativeElement.querySelectorAll('.kpi-card__value');

    expect(values[0].textContent).toContain('5,6%');
    expect(values[0].classList).toContain('kpi-card__value--emphasis');
    expect(values[1].textContent).toContain('70');
    expect(values[1].classList).toContain('kpi-card__value--muted');
  });
});
