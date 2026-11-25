
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { PostRepository } from './domains/feed/data/post.repository';
import { SupabasePostRepository } from './domains/feed/data/supabase-post.repository';

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
