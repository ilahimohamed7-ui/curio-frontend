import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter
} from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InterestService } from '../data/interest.service';
import { onboardingCompleteGuard } from './onboarding.guard';

describe('onboardingCompleteGuard', () => {
  const mockInterestService = { getInterests: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: InterestService, useValue: mockInterestService }
      ]
    });
  });

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      onboardingCompleteGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/home' } as RouterStateSnapshot
      )
    );

  it('lässt Benutzer mit gespeicherten Interessen zum Feed', async () => {
    mockInterestService.getInterests.mockResolvedValue(['Wissenschaft']);

    await expect(runGuard()).resolves.toBe(true);
  });

  it('leitet Benutzer ohne Interessen zur Interessen-Auswahl', async () => {
    mockInterestService.getInterests.mockResolvedValue([]);

    const result = await runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/interest-setup'
    );
  });

  it('zeigt den Feed, wenn die Interessen nicht geladen werden können', async () => {
    mockInterestService.getInterests.mockRejectedValue(new Error('Netzwerk'));

    await expect(runGuard()).resolves.toBe(true);
  });
});
