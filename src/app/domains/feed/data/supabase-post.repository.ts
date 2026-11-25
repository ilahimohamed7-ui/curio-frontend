
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';

import { supabase } from '../../../core/supabase/supabase.client';
import { PostRepository } from './post.repository';
import { Post } from './post.model';

@Injectable()
export class SupabasePostRepository extends PostRepository {
  override getPosts(): Observable<Post[]> {
    return from(
      supabase
        .from('posts')
        .select(
          'id, category, title, description, source, emoji, likes, comments, color'
        )
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return (data ?? []) as Post[];
      })
    );
  }

  override getPostsByCategory(
    category: string
  ): Observable<Post[]> {
    if (category === 'Alle') {
      return this.getPosts();
    }

    return from(
      supabase
        .from('posts')
        .select(
          'id, category, title, description, source, emoji, likes, comments, color'
        )
        .eq('category', category)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return (data ?? []) as Post[];
      })
    );
  }
}
