import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

/**
 * Zentraler Supabase-Client für die gesamte Anwendung.
 *
 * Wird per Dependency Injection bereitgestellt statt als globale Variable,
 * damit er sich in Tests einfach durch einen Mock ersetzen lässt:
 * `{ provide: SUPABASE_CLIENT, useValue: mockClient }`.
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>(
  'SUPABASE_CLIENT',
  {
    providedIn: 'root',
    factory: () =>
      createClient(environment.supabaseUrl, environment.supabasePublishableKey)
  }
);
