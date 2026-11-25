
import { describe, it, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { FeedService } from './feed.service';
import { InMemoryPostRepository } from '../data-access/in-memory-post.repository';

describe('FeedService', () => {
  const createService = () =>
    new FeedService(new InMemoryPostRepository());

  it('sollte drei Beiträge zurückgeben', async () => {
    const service = createService();
    const posts = await firstValueFrom(service.getPosts());

    expect(posts).toHaveLength(3);
  });

  it('sollte alle Beiträge zurückgeben, wenn Alle ausgewählt ist', async () => {
    const service = createService();
    const posts = await firstValueFrom(
      service.getPostsByCategory('Alle')
    );

    expect(posts).toHaveLength(3);
  });

  it('sollte nur wissenschaftliche Beiträge zurückgeben', async () => {
    const service = createService();
    const posts = await firstValueFrom(
      service.getPostsByCategory('Wissenschaft')
    );

    expect(posts).toHaveLength(1);
    expect(posts[0].category).toBe('Wissenschaft');
  });

  it('sollte eine leere Liste bei unbekannter Kategorie zurückgeben', async () => {
    const service = createService();
    const posts = await firstValueFrom(
      service.getPostsByCategory('Sport')
    );

    expect(posts).toHaveLength(0);
  });

  it('sollte Änderungen an zurückgegebenen Beiträgen nicht in den internen Daten speichern', async () => {
    const service = createService();
    const posts = await firstValueFrom(service.getPosts());

    posts[0].title = 'Veränderter Titel';

    const freshPosts = await firstValueFrom(service.getPosts());

    expect(freshPosts[0].title).toBe(
      'Saturn könnte auf Wasser schwimmen'
    );
  });
});
