
import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private async withTimeout<T>(operation: Promise<T>): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(
              new Error(
                'Die Anfrage dauert zu lange. Prüfe deine Supabase-Verbindung.'
              )
            );
          }, 15000);
        })
      ]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  async register(email: string, password: string) {
    const { data, error } = await this.withTimeout(
      supabase.auth.signUp({ email, password })
    );

    if (error) {
      throw error;
    }

    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.withTimeout(
      supabase.auth.signInWithPassword({ email, password })
    );

    if (error) {
      throw error;
    }

    return data;
  }

  async logout(): Promise<void> {
    const { error } = await this.withTimeout(
      supabase.auth.signOut()
    );

    if (error) {
      throw error;
    }
  }

  /**
   * Liefert den angemeldeten Benutzer aus der lokal gespeicherten Sitzung.
   * Das braucht keine Netzwerkanfrage; abgelaufene Tokens erneuert Supabase
   * automatisch. Der eigentliche Datenschutz erfolgt über Row Level Security.
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session?.user ?? null;
  }
}
