import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';
import { authGuard } from './core/auth/auth.guard';
import { onboardingCompleteGuard } from './domains/feed/feature-onboarding/onboarding.guard';

describe('App-Routen', () => {
  const findRoute = (path: string) => routes.find(route => route.path === path);

  it('lässt den Login öffentlich', () => {
    expect(findRoute('login')?.canActivate).toBeUndefined();
  });

  it('schützt Feed und Interessen-Auswahl mit dem authGuard', () => {
    for (const path of ['home', 'interest-setup']) {
      expect(findRoute(path)?.canActivate?.[0]).toBe(authGuard);
    }
  });

  it('prüft vor dem Feed, ob das Onboarding abgeschlossen ist', () => {
    expect(findRoute('home')?.canActivate).toEqual([
      authGuard,
      onboardingCompleteGuard
    ]);
  });

  it('lädt alle Seiten per Lazy Loading', () => {
    for (const path of ['login', 'home', 'interest-setup']) {
      expect(findRoute(path)?.loadComponent).toBeTypeOf('function');
    }
  });
});
