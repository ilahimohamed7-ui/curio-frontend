
import { Observable } from 'rxjs';

import { Post } from './post.model';

export abstract class PostRepository {
  abstract getPosts(): Observable<Post[]>;

  abstract getPostsByCategory(
    category: string
  ): Observable<Post[]>;
}
