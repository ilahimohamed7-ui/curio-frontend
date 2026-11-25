import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { InterestService } from '../data/interest.service';

/**
 * Leitet Benutzer ohne gespeicherte Interessen zur Interessen-Auswahl.
 *
 * Damit liegt die Entscheidung "Onboarding nötig?" in der Feed-Domain und
 * nicht im Login. Die Auth-Domain muss nichts über Interessen wissen.
 */
export const onboardingCompleteGuard: CanActivateFn = async () => {
  const interestService = inject(InterestService);
  const router = inject(Router);

  try {
    const interests = await interestService.getInterests();
    return interests.length > 0 ? true : router.parseUrl('/interest-setup');
  } catch (error) {
    // Interessen nicht ladbar: Feed trotzdem zeigen, dort erscheint ein Hinweis.
    console.error('Interessen-Prüfung fehlgeschlagen:', error);
    return true;
  }
};
