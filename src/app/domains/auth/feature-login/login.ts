import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

const MIN_PASSWORD_LENGTH = 8;

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
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly minPasswordLength = MIN_PASSWORD_LENGTH;

  readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly isLogin = signal(true);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly message = signal('');
  readonly isError = signal(false);

  /** Fehlertext für das E-Mail-Feld oder `null`, wenn alles passt. */
  emailError(): string | null {
    const control = this.form.controls.email;
    if (!this.shouldShowError(control)) return null;
    if (control.hasError('required')) return 'Bitte gib deine E-Mail-Adresse ein.';
    if (control.hasError('email')) return 'Bitte gib eine gültige E-Mail-Adresse ein.';
    return null;
  }

  /** Fehlertext für das Passwort-Feld oder `null`, wenn alles passt. */
  passwordError(): string | null {
    const control = this.form.controls.password;
    if (!this.shouldShowError(control)) return null;
    if (control.hasError('required')) return 'Bitte gib dein Passwort ein.';
    if (control.hasError('minlength')) {
      return `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`;
    }
    return null;
  }

  async submit(): Promise<void> {
    if (this.loading()) return;

    this.submitted.set(true);
    this.message.set('');
    this.isError.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value.trim();
    const password = this.form.controls.password.value;

    this.loading.set(true);

    try {
      if (this.isLogin()) {
        await this.authService.login(email, password);
        // Ob zuerst die Interessen-Auswahl nötig ist, entscheidet der
        // onboardingCompleteGuard der Feed-Route.
        await this.router.navigate(['/home']);
      } else {
        const { session } = await this.authService.register(email, password);

        if (session) {
          // E-Mail-Bestätigung ist deaktiviert: Nutzer ist direkt angemeldet.
          await this.router.navigate(['/interest-setup']);
        } else {
          this.setMode(true);
          this.message.set(
            'Fast geschafft! Wir haben dir eine E-Mail geschickt. Bestätige deine Adresse und melde dich dann an.'
          );
        }
      }
    } catch (error: unknown) {
      console.error('Authentifizierung fehlgeschlagen:', error);
      this.isError.set(true);
      this.message.set(toUserMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  toggleMode(): void {
    this.setMode(!this.isLogin());
  }

  /**
   * Wechselt zwischen Anmelden und Registrieren. Die Mindestlänge des
   * Passworts gilt nur beim Registrieren, damit bestehende Konten mit
   * kürzeren Passwörtern sich weiterhin anmelden können.
   */
  private setMode(isLogin: boolean): void {
    this.isLogin.set(isLogin);
    this.submitted.set(false);
    this.message.set('');
    this.isError.set(false);

    const password = this.form.controls.password;
    password.setValidators(
      isLogin
        ? [Validators.required]
        : [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]
    );
    password.reset();
    password.updateValueAndValidity();
  }

  private shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }
}
