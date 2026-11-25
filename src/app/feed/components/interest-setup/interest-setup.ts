import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  InterestCategory,
  InterestService
} from '../../services/interest.service';

@Component({
  selector: 'app-interest-setup',
  templateUrl: './interest-setup.html',
  styleUrl: './interest-setup.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestSetup {
  private readonly interestService = inject(InterestService);
  private readonly router = inject(Router);

  readonly categories: InterestCategory[] = [
    'Wissenschaft',
    'Technologie',
    'Psychologie'
  ];

  readonly selectedInterests = signal<InterestCategory[]>([]);
  readonly loading = signal(false);
  readonly message = signal('');

  toggleInterest(category: InterestCategory): void {
    this.selectedInterests.update(current =>
      current.includes(category)
        ? current.filter(item => item !== category)
        : [...current, category]
    );
  }

  async save(): Promise<void> {
    if (this.loading()) {
      return;
    }

    if (this.selectedInterests().length === 0) {
      this.message.set('Bitte wähle mindestens ein Interesse aus.');
      return;
    }

    this.loading.set(true);
    this.message.set('');

    try {
      await this.interestService.saveInterests(this.selectedInterests());
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error('Interessen konnten nicht gespeichert werden:', error);
      // Supabase liefert Fehler als einfache Objekte mit "message", nicht als Error.
      const raw =
        typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : '';
      const detail = raw ? ` (${raw})` : '';
      this.message.set(`Speichern fehlgeschlagen. Bitte versuche es erneut.${detail}`);
    } finally {
      this.loading.set(false);
    }
  }
}
