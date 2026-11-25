
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  InterestCategory,
  InterestService
} from '../../services/interest.service';

@Component({
  selector: 'app-interest-setup',
  standalone: true,
  templateUrl: './interest-setup.html',
  styleUrl: './interest-setup.css'
})
export class InterestSetup {
  readonly categories: InterestCategory[] = [
    'Wissenschaft',
    'Technologie',
    'Psychologie'
  ];

  selectedInterests: InterestCategory[] = [];
  loading = false;
  message = '';

  constructor(
    private readonly interestService: InterestService,
    private readonly router: Router
  ) {}

  toggleInterest(category: InterestCategory): void {
    this.selectedInterests = this.selectedInterests.includes(category)
      ? this.selectedInterests.filter(item => item !== category)
      : [...this.selectedInterests, category];
  }

  async save(): Promise<void> {
    if (this.selectedInterests.length === 0) {
      this.message = 'Bitte wähle mindestens ein Interesse aus.';
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      await this.interestService.saveInterests(this.selectedInterests);
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error('Interessen konnten nicht gespeichert werden:', error);
      this.message = 'Speichern fehlgeschlagen. Bitte versuche es erneut.';
    } finally {
      this.loading = false;
    }
  }
}
