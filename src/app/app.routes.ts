
import { Routes } from '@angular/router';
import { Auth } from './core/auth/auth';
import { authGuard } from './core/auth/auth.guard';
import { InterestSetup } from './feed/components/interest-setup/interest-setup';

export const routes: Routes = [
  {
    path: 'login',
    component: Auth
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feed/components/feed-list/feed-list')
        .then(m => m.FeedList)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'interest-setup',
    component: InterestSetup,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
