
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { PostRepository } from './feed/data-access/post.repository';
import { InMemoryPostRepository } from './feed/data-access/in-memory-post.repository';
import { SupabasePostRepository } from './feed/data-access/supabase-post.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: PostRepository,
      useClass: SupabasePostRepository
    }
  ]
};
