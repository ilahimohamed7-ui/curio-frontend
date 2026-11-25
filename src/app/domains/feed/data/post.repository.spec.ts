
import { describe, it, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { PostRepository } from './post.repository';
import { InMemoryPostRepository } from './in-memory-post.repository';

describe('PostRepository', () => {
  it('sollte vom InMemoryPostRepository implementiert werden', () => {
    const repository: PostRepository = new InMemoryPostRepository();

    expect(repository).toBeInstanceOf(InMemoryPostRepository);
  });

  it('sollte die erforderlichen Methoden bereitstellen', () => {
    const repository: PostRepository = new InMemoryPostRepository();

    expect(typeof repository.getPosts).toBe('function');
    expect(typeof repository.getPostsByCategory).toBe('function');
  });

  it('sollte Beiträge nach Kategorie filtern', async () => {
    const repository: PostRepository = new InMemoryPostRepository();
    const posts = await firstValueFrom(
      repository.getPostsByCategory('Technologie')
    );

    expect(posts).toHaveLength(1);
    expect(posts[0].category).toBe('Technologie');
  });
});
