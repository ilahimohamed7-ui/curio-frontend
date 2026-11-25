import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';

import { SUPABASE_CLIENT } from '../../../core/supabase/supabase.client';
import { ALL_CATEGORIES } from './category';
import { Post } from './post.model';
import { PostRepository } from './post.repository';

const POST_COLUMNS =
  'id, category, title, description, source, emoji, likes, comments, color';

@Injectable()
export class SupabasePostRepository extends PostRepository {
  private readonly supabase = inject(SUPABASE_CLIENT);

  override getPosts(): Observable<Post[]> {
    return this.getPostsByCategory(ALL_CATEGORIES);
  }

  override getPostsByCategory(category: string): Observable<Post[]> {
    let query = this.supabase.from('posts').select(POST_COLUMNS);

    if (category !== ALL_CATEGORIES) {
      query = query.eq('category', category);
    }

    return from(query.order('created_at', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as Post[];
      })
    );
  }
}
