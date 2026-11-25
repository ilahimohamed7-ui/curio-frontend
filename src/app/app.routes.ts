import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { onboardingCompleteGuard } from './domains/feed/feature-onboarding/onboarding.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Anmelden – Curio',
    loadComponent: () =>
      import('./domains/auth/feature-login/login').then(m => m.Login)
  },
  {
    path: 'interest-setup',
    title: 'Interessen wählen – Curio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/feed/feature-onboarding/interest-setup').then(
        m => m.InterestSetup
      )
  },
  {
    path: 'home',
    title: 'Dein Feed – Curio',
    canActivate: [authGuard, onboardingCompleteGuard],
    loadComponent: () =>
      import('./domains/feed/feature-feed/feed-page').then(m => m.FeedPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
