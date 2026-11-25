import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { InterestCategory } from '../../data/category';

/**
 * Auswahl der Interessen als Chips. Wird im Onboarding und im Feed
 * wiederverwendet. Reine Darstellungskomponente: Der Aufrufer entscheidet,
 * was beim Umschalten passiert (lokal merken oder direkt speichern).
 */
@Component({
  selector: 'app-interest-picker',
  template: `
    <div class="chip-group" role="group" [attr.aria-labelledby]="labelledBy()">
      @for (option of options(); track option) {
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="selected().includes(option)"
          [disabled]="disabled()"
          (click)="toggled.emit(option)"
        >
          @if (selected().includes(option)) {
            <span aria-hidden="true">✓ </span>
          }
          {{ option }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestPicker {
  readonly options = input.required<readonly InterestCategory[]>();
  readonly selected = input.required<readonly InterestCategory[]>();
  readonly disabled = input(false);
  /** ID der Überschrift, die die Gruppe für Screenreader beschriftet. */
  readonly labelledBy = input<string>();

  readonly toggled = output<InterestCategory>();
}
