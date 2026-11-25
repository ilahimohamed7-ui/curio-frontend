import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const user = await authService.getCurrentUser();
    return user ? true : router.parseUrl('/login');
  } catch {
    // Bei einem Prüfungsfehler wird der Zugriff sicherheitshalber verweigert.
    return router.parseUrl('/login');
  }
};
