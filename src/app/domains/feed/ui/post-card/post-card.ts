import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Post } from '../../data/post.model';

/** Zeigt einen einzelnen Wissensbeitrag an. Reine Darstellungskomponente. */
@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCard {
  readonly post = input.required<Post>();
}
