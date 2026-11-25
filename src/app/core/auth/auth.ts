import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { InterestService } from '../../feed/services/interest.service';

/** Übersetzt bekannte Supabase-Fehler in verständliche deutsche Meldungen. */
function toUserMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : '';
  const text = raw.toLowerCase();

  if (text.includes('invalid login credentials')) {
    return 'E-Mail-Adresse oder Passwort ist falsch.';
  }
  if (text.includes('email not confirmed')) {
    return 'Bitte bestätige zuerst deine E-Mail-Adresse über den Link in deinem Postfach.';
  }
  if (text.includes('user already registered')) {
    return 'Für diese E-Mail-Adresse gibt es bereits ein Konto.';
  }
  if (text.includes('rate limit') || text.includes('too many requests')) {
    return 'Zu viele Versuche. Bitte warte kurz und versuche es dann erneut.';
  }
  if (text.includes('password should be at least')) {
    return 'Das Passwort ist zu kurz.';
  }
  if (text.includes('unable to validate email') || text.includes('invalid format')) {
    return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  }
  if (text.includes('failed to fetch') || text.includes('network')) {
    return 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.';
  }

  return raw || 'Es ist ein unerwarteter Fehler aufgetreten.';
}

@Component({
  selector: 'app-auth',
  imports: [FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Auth {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly interestService = inject(InterestService);

  readonly isLogin = signal(true);
  readonly loading = signal(false);
  readonly message = signal('');
  readonly isError = signal(false);

  email = '';
  password = '';

  async submit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    this.message.set('');
    this.isError.set(false);

    const email = this.email.trim();

    if (!email || !this.password) {
      this.showError('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    if (!this.isLogin() && this.password.length < 8) {
      this.showError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    this.loading.set(true);

    try {
      if (this.isLogin()) {
        await this.authService.login(email, this.password);
        await this.router.navigate([await this.targetAfterLogin()]);
      } else {
        const { session } = await this.authService.register(email, this.password);

        if (session) {
          // E-Mail-Bestätigung ist deaktiviert: Nutzer ist direkt angemeldet.
          await this.router.navigate(['/interest-setup']);
        } else {
          this.message.set(
            'Fast geschafft! Wir haben dir eine E-Mail geschickt. Bestätige deine Adresse und melde dich dann an.'
          );
          this.isLogin.set(true);
          this.password = '';
        }
      }
    } catch (error: unknown) {
      console.error('Authentifizierung fehlgeschlagen:', error);
      this.showError(toUserMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  toggleMode(): void {
    this.isLogin.update(value => !value);
    this.message.set('');
    this.isError.set(false);
  }

  private async targetAfterLogin(): Promise<string> {
    try {
      const interests = await this.interestService.getInterests();
      return interests.length === 0 ? '/interest-setup' : '/home';
    } catch (error) {
      // Interessen nicht ladbar: trotzdem zum Feed, dort erscheint ein Hinweis.
      console.error('Interessen-Abfrage fehlgeschlagen:', error);
      return '/home';
    }
  }

  private showError(message: string): void {
    this.isError.set(true);
    this.message.set(message);
  }
}
