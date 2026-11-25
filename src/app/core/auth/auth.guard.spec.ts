import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../../app.routes';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const mockAuthService = {
    getCurrentUser: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  async function runGuard(url = '/home') {
    return TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url } as RouterStateSnapshot
      )
    );
  }

  it('erlaubt den Zugriff, wenn Supabase einen Benutzer bestätigt', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({ id: 'user-1' });

    await expect(runGuard()).resolves.toBe(true);
    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
  });

  it('leitet ohne angemeldeten Benutzer zum Login um', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    const result = await runGuard('/interest-setup');

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('verweigert den Zugriff bei einem Fehler der Sitzungsprüfung', async () => {
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Netzwerkfehler'));

    const result = await runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('schützt Feed und Interessen-Auswahl, lässt Login öffentlich', () => {
    expect(routes.find(route => route.path === 'login')?.canActivate).toBeUndefined();

    for (const path of ['home', 'interest-setup']) {
      expect(routes.find(route => route.path === path)?.canActivate).toEqual([
        authGuard
      ]);
    }
  });
});
