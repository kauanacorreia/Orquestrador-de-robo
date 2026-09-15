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

  it('shows the raw value first and the secondary (rate) value muted below, always', () => {
    fixture.componentRef.setInput('value', 1180);
    fixture.componentRef.setInput('rateLabel', 'Taxa de sucesso');
    fixture.componentRef.setInput('secondaryValue', '94,4%');
    fixture.detectChanges();

    const values = fixture.nativeElement.querySelectorAll('.kpi-card__value');

    expect(values[0].textContent).toContain('1180');
    expect(values[1].textContent).toContain('94,4%');
    expect(values[1].classList).toContain('kpi-card__value--muted');

    expect(fixture.nativeElement.querySelector('.kpi-card__rate-label')?.textContent).toContain(
      'Taxa de sucesso',
    );
  });

  it('renders the unit label under the value when provided', () => {
    fixture.componentRef.setInput('unitLabel', 'finalizadas com êxito');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.kpi-card__unit')?.textContent).toContain('finalizadas com êxito');
  });

  it('shows the tooltip icon only when a tooltip is provided', () => {
    let element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.kpi-card__info')).toBeFalsy();

    fixture.componentRef.setInput('tooltip', 'Descrição do KPI para acessibilidade.');
    fixture.detectChanges();

    element = fixture.nativeElement;
    expect(element.querySelector('.kpi-card__info')).toBeTruthy();
  });
});
