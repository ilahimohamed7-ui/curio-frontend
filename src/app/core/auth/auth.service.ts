import { Injectable, computed, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '../supabase/supabase.client';

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Verwaltet Anmeldung und Sitzung.
 *
 * Der angemeldete Benutzer steht als Signal bereit und wird über
 * `onAuthStateChange` automatisch aktuell gehalten (Login, Logout,
 * Token-Erneuerung, Abmeldung in einem anderen Tab).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  private readonly currentUser = signal<User | null>(null);

  /** Der angemeldete Benutzer oder `null`. */
  readonly user = this.currentUser.asReadonly();

  /** `true`, sobald ein Benutzer angemeldet ist. */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async register(email: string, password: string) {
    const { data, error } = await this.withTimeout(
      this.supabase.auth.signUp({ email, password })
    );

    if (error) throw error;
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.withTimeout(
      this.supabase.auth.signInWithPassword({ email, password })
    );

    if (error) throw error;
    return data;
  }

  async logout(): Promise<void> {
    const { error } = await this.withTimeout(this.supabase.auth.signOut());

    if (error) throw error;
  }

  /**
   * Liefert den angemeldeten Benutzer aus der lokal gespeicherten Sitzung.
   * Das braucht keine Netzwerkanfrage; abgelaufene Tokens erneuert Supabase
   * automatisch. Der eigentliche Datenschutz erfolgt über Row Level Security.
   */
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getSession();

    if (error) throw error;

    const user = data.session?.user ?? null;
    this.currentUser.set(user);
    return user;
  }

  private async withTimeout<T>(operation: Promise<T>): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () =>
              reject(
                new Error(
                  'Die Anfrage dauert zu lange. Prüfe deine Internetverbindung.'
                )
              ),
            REQUEST_TIMEOUT_MS
          );
        })
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
