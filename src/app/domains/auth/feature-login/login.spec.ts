import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/auth/auth.service';
import { Login } from './login';

describe('Login', () => {
  const mockAuthService = {
    login: vi.fn(),
    register: vi.fn()
  };
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    navigateSpy = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const element = () => fixture.nativeElement as HTMLElement;

  async function submit() {
    await component.submit();
    fixture.detectChanges();
  }

  it('sendet ein leeres Formular nicht ab und zeigt Feldfehler', async () => {
    await submit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(element().textContent).toContain('Bitte gib deine E-Mail-Adresse ein.');
    expect(element().textContent).toContain('Bitte gib dein Passwort ein.');
    expect(
      element().querySelector('#email')?.getAttribute('aria-invalid')
    ).toBe('true');
  });

  it('weist eine ungültige E-Mail-Adresse zurück', async () => {
    component.form.setValue({ email: 'keine-mail', password: 'geheim123' });

    await submit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(element().textContent).toContain('Bitte gib eine gültige E-Mail-Adresse ein.');
  });

  it('meldet mit gültigen Daten an und leitet zum Feed weiter', async () => {
    mockAuthService.login.mockResolvedValue({});
    // Beim Anmelden gilt keine Mindestlänge (bestehende Konten).
    component.form.setValue({ email: 'anna@beispiel.de', password: 'kurz' });

    await submit();

    expect(mockAuthService.login).toHaveBeenCalledWith('anna@beispiel.de', 'kurz');
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('verlangt beim Registrieren mindestens 8 Zeichen', async () => {
    component.toggleMode();
    component.form.setValue({ email: 'anna@beispiel.de', password: 'kurz' });

    await submit();

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(element().textContent).toContain('mindestens 8 Zeichen');
  });

  it('zeigt Supabase-Fehler als verständliche deutsche Meldung', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid login credentials'));
    component.form.setValue({ email: 'anna@beispiel.de', password: 'falsch123' });

    await submit();

    expect(element().querySelector('[role="alert"]')?.textContent).toContain(
      'E-Mail-Adresse oder Passwort ist falsch.'
    );
  });
});
