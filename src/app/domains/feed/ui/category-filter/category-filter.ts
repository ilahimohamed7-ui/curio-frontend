import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CategoryFilter as CategoryFilterOption } from '../../data/category';

/** Filterleiste für die Feed-Kategorien. Reine Darstellungskomponente. */
@Component({
  selector: 'app-category-filter',
  template: `
    <nav class="category-options chip-group" [attr.aria-label]="label()">
      @for (option of options(); track option) {
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="option === selected()"
          (click)="selectedChange.emit(option)"
        >
          {{ option }}
        </button>
      }
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    .category-options {
      justify-content: flex-end;
    }

    @media (max-width: 47.5rem) {
      .category-options {
        justify-content: flex-start;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFilter {
  readonly options = input.required<readonly CategoryFilterOption[]>();
  readonly selected = input.required<CategoryFilterOption>();
  readonly label = input('Beiträge nach Kategorie filtern');

  readonly selectedChange = output<CategoryFilterOption>();
}
