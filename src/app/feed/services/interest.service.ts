
import { inject, Injectable, InjectionToken } from '@angular/core';
import { supabase } from '../../core/supabase.client';

export const INTEREST_SUPABASE_CLIENT = new InjectionToken<typeof supabase>(
  'INTEREST_SUPABASE_CLIENT',
  {
    providedIn: 'root',
    factory: () => supabase
  }
);

export type InterestCategory =
  | 'Wissenschaft'
  | 'Technologie'
  | 'Psychologie';

@Injectable({
  providedIn: 'root'
})
export class InterestService {
  private readonly supabaseClient = inject(INTEREST_SUPABASE_CLIENT);

  private readonly categories: InterestCategory[] = [
    'Wissenschaft',
    'Technologie',
    'Psychologie'
  ];

  async getInterests(): Promise<InterestCategory[]> {
    const { data: userData, error: userError } =
      await this.supabaseClient.auth.getUser();

    if (userError) throw userError;

    const user = userData.user;

    if (!user) {
      throw new Error('Bitte melde dich zuerst an.');
    }

    const { data, error } = await this.supabaseClient
      .from('user_interests')
      .select('category')
      .eq('user_id', user.id);

    if (error) throw error;

    return (data ?? []).map(
      row => row.category as InterestCategory
    );
  }

  async saveInterests(
    interests: InterestCategory[]
  ): Promise<void> {
    const uniqueInterests = [...new Set(interests)];

    if (
      uniqueInterests.some(
        category => !this.categories.includes(category)
      )
    ) {
      throw new Error('Eine ausgewählte Kategorie ist ungültig.');
    }

    const { error } = await this.supabaseClient.rpc('save_user_interests', {
      p_categories: uniqueInterests
    });

    if (error) throw error;
  }
}
