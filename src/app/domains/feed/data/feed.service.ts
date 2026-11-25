import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Post } from './post.model';
import { PostRepository } from './post.repository';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly postRepository = inject(PostRepository);

  getPosts(): Observable<Post[]> {
    return this.postRepository.getPosts();
  }

  getPostsByCategory(category: string): Observable<Post[]> {
    return this.postRepository.getPostsByCategory(category);
  }
}
