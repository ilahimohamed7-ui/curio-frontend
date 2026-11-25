import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Post } from '../../data/post.model';

/** Beiträge, die jünger sind als dieser Zeitraum, gelten als "Neu". */
const NEW_POST_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Zeigt einen einzelnen Wissensbeitrag an. Reine Darstellungskomponente. */
@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCard {
  readonly post = input.required<Post>();

  /** Referenzzeitpunkt für "Neu"; als Input überschreibbar für Tests. */
  readonly now = input<number>(Date.now());

  readonly isNew = computed(() => {
    const created = Date.parse(this.post().createdAt);
    return !Number.isNaN(created) && this.now() - created < NEW_POST_WINDOW_MS;
  });
}
