
import { Observable } from 'rxjs';

import { Post } from '../models/post.model';

export abstract class PostRepository {
  abstract getPosts(): Observable<Post[]>;

  abstract getPostsByCategory(
    category: string
  ): Observable<Post[]>;
}
