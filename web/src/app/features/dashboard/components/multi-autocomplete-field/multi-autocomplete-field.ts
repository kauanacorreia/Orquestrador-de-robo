import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

export interface AutocompleteOption {
  id: string;
  name: string;
}

// Faixa dos diacríticos combinantes (acentos) em Unicode, construída via
// código para evitar problemas de encoding com escapes \u em ferramentas
// de edição de texto.
const DIACRITICS_REGEX = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g');

function normalize(value: string): string {
  return (value ?? '').trim().toLowerCase().normalize('NFD').replace(DIACRITICS_REGEX, '');
}

// Filtro multi-valor que aceita tanto clicar/selecionar na lista quanto
// digitar pra buscar (autocomplete), com os valores escolhidos exibidos
// como chips removíveis.
@Component({
  selector: 'app-multi-autocomplete-field',
  imports: [FormsModule, MatAutocompleteModule, MatChipsModule, MatFormFieldModule, MatIconModule],
  templateUrl: './multi-autocomplete-field.html',
  styleUrl: './multi-autocomplete-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiAutocompleteField {
  @Input({ required: true }) label!: string;
  @Input() options: AutocompleteOption[] = [];
  @Input() selectedIds: string[] = [];
  @Output() selectedIdsChange = new EventEmitter<string[]>();

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  readonly searchTerm = signal('');

  get selectedOptions(): AutocompleteOption[] {
    return this.options.filter((option) => this.selectedIds.includes(option.id));
  }

  get filteredOptions(): AutocompleteOption[] {
    const term = normalize(this.searchTerm());

    return this.options
      .filter((option) => !this.selectedIds.includes(option.id))
      .filter((option) => !term || normalize(option.name).includes(term));
  }

  onInput(value: string): void {
    this.searchTerm.set(value);
  }

  select(event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value as string;

    this.selectedIdsChange.emit([...this.selectedIds, id]);
    this.resetInput();
  }

  remove(id: string): void {
    this.selectedIdsChange.emit(this.selectedIds.filter((selectedId) => selectedId !== id));
  }

  private resetInput(): void {
    this.searchTerm.set('');

    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.value = '';
    }
  }
}
