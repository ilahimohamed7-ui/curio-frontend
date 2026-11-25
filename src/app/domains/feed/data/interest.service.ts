import { Injectable, inject } from '@angular/core';

import { SUPABASE_CLIENT } from '../../../core/supabase/supabase.client';
import { InterestCategory, isInterestCategory } from './category';

export type { InterestCategory } from './category';

@Injectable({ providedIn: 'root' })
export class InterestService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  async getInterests(): Promise<InterestCategory[]> {
    // Lokale Sitzung statt getUser(): spart eine Netzwerkanfrage pro Aufruf.
    const { data: sessionData, error: sessionError } =
      await this.supabase.auth.getSession();

    if (sessionError) throw sessionError;

    const user = sessionData.session?.user;

    if (!user) {
      throw new Error('Bitte melde dich zuerst an.');
    }

    const { data, error } = await this.supabase
      .from('user_interests')
      .select('category')
      .eq('user_id', user.id);

    if (error) throw error;

    return (data ?? [])
      .map(row => row.category)
      .filter(isInterestCategory);
  }

  async saveInterests(interests: InterestCategory[]): Promise<void> {
    const uniqueInterests = [...new Set(interests)];

    if (!uniqueInterests.every(isInterestCategory)) {
      throw new Error('Eine ausgewählte Kategorie ist ungültig.');
    }

    const { error } = await this.supabase.rpc('save_user_interests', {
      p_categories: uniqueInterests
    });

    if (error) throw error;
  }
}
