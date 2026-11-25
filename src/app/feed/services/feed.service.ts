
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Post } from '../models/post.model';
import { PostRepository } from '../data-access/post.repository';

@Injectable({ providedIn: 'root' })
export class FeedService {
  constructor(
    private readonly postRepository: PostRepository
  ) {}

  getPosts(): Observable<Post[]> {
    return this.postRepository.getPosts();
  }

  getPostsByCategory(category: string): Observable<Post[]> {
    return this.postRepository.getPostsByCategory(category);
  }
}
