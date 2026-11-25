
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { InterestService } from '../../feed/services/interest.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {
  isLogin = true;
  email = '';
  password = '';
  loading = false;
  message = '';
  isError = false;

  constructor(
  private readonly authService: AuthService,
  private readonly router: Router,
  private readonly interestService: InterestService
) {}


async submit(): Promise<void> {
  this.message = '';
  this.isError = false;

  if (!this.email.trim() || !this.password) {
    this.message = 'Bitte E-Mail und Passwort eingeben.';
    this.isError = true;
    return;
  }

  this.loading = true;

  try {
    if (this.isLogin) {
      // 1. Benutzer anmelden
      await this.authService.login(
        this.email.trim(),
        this.password
      );

      // 2. Interessen mit Zeitlimit laden
      let interests: string[] = [];

      try {
        interests = await Promise.race([
          this.interestService.getInterests(),
          new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(
                new Error('Zeitüberschreitung beim Laden der Interessen.')
              ),
              8000
            );
          })
        ]);
      } catch (error) {
        console.error('Interessen-Abfrage fehlgeschlagen:', error);

        // Bei einem Ladefehler trotzdem zum Feed wechseln.
        await this.router.navigate(['/home']);
        return;
      }

      // 3. Weiterleitung abhängig von den Interessen
      if (interests.length === 0) {
        await this.router.navigate(['/interest-setup']);
      } else {
        await this.router.navigate(['/home']);
      }
    } else {
      await this.authService.register(
        this.email.trim(),
        this.password
      );

      this.message =
        'Registrierung gesendet. Prüfe deine E-Mails, falls eine Bestätigung erforderlich ist.';
    }
  } catch (error: unknown) {
    console.error('Authentifizierung fehlgeschlagen:', error);
    this.isError = true;
    this.message =
      error instanceof Error
        ? error.message
        : 'Es ist ein unerwarteter Fehler aufgetreten.';
  } finally {
    this.loading = false;
  }
}
toggleMode(): void {
  this.loading = false;
  this.isLogin = !this.isLogin;
  this.message = '';
  this.isError = false;
}
}
