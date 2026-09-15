import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { MultiAutocompleteField } from './multi-autocomplete-field';

describe('MultiAutocompleteField', () => {
  let component: MultiAutocompleteField;
  let fixture: ComponentFixture<MultiAutocompleteField>;

  const options = [
    { id: 'robot-1', name: 'Robô Faturamento' },
    { id: 'robot-2', name: 'Robô Conciliação Bancária' },
    { id: 'robot-3', name: 'Robô Emissão de NF-e' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiAutocompleteField, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiAutocompleteField);
    component = fixture.componentInstance;
    component.label = 'Robô';
    component.options = options;
    component.selectedIds = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters options by typed text, ignoring case and accents', () => {
    component.onInput('faturamento');
    expect(component.filteredOptions).toEqual([options[0]]);

    component.onInput('conciliacao');
    expect(component.filteredOptions).toEqual([options[1]]);
  });

  it('excludes already-selected options from the filtered list', () => {
    component.selectedIds = ['robot-1'];
    expect(component.filteredOptions).toEqual([options[1], options[2]]);
  });

  it('emits the new selection when an option is picked from the list', () => {
    const emitted: string[][] = [];
    component.selectedIdsChange.subscribe((value) => emitted.push(value));

    component.select({ option: { value: 'robot-2' } } as MatAutocompleteSelectedEvent);

    expect(emitted[0]).toEqual(['robot-2']);
  });

  it('emits the selection without the removed id', () => {
    component.selectedIds = ['robot-1', 'robot-2'];

    const emitted: string[][] = [];
    component.selectedIdsChange.subscribe((value) => emitted.push(value));

    component.remove('robot-1');

    expect(emitted[0]).toEqual(['robot-2']);
  });
});
