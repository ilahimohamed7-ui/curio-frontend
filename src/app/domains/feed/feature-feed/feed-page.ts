import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import {
  ALL_CATEGORIES,
  CATEGORY_FILTERS,
  CategoryFilter,
  INTEREST_CATEGORIES,
  InterestCategory,
  isInterestCategory
} from '../data/category';
import { FeedService } from '../data/feed.service';
import { InterestService } from '../data/interest.service';
import { Post } from '../data/post.model';
import { CategoryFilter as CategoryFilterBar } from '../ui/category-filter/category-filter';
import { InterestPicker } from '../ui/interest-picker/interest-picker';
import { PostCard } from '../ui/post-card/post-card';

@Component({
  selector: 'app-feed-page',
  imports: [RouterLink, CategoryFilterBar, InterestPicker, PostCard],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedPage implements OnInit {
  private readonly feedService = inject(FeedService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly interestService = inject(InterestService);

  readonly categories = CATEGORY_FILTERS;
  readonly interestCategories = INTEREST_CATEGORIES;
  /** Anzahl der Platzhalter-Karten während des Ladens. */
  readonly skeletons = [1, 2, 3];

  readonly selectedCategory = signal<CategoryFilter>(ALL_CATEGORIES);
  readonly selectedInterests = signal<InterestCategory[]>([]);
  readonly interestsLoading = signal(true);
  readonly interestsSaving = signal(false);
  readonly message = signal('');

  /**
   * Beiträge der gewählten Kategorie. Lädt automatisch neu, sobald sich
   * `selectedCategory` ändert, und stellt Daten, Ladezustand und Fehler
   * als Signals bereit.
   */
  readonly posts = rxResource({
    params: () => this.selectedCategory(),
    stream: ({ params: category }) =>
      this.feedService.getPostsByCategory(category)
  });

  /** Bei "Alle" nur Beiträge aus den eigenen Interessen anzeigen. */
  readonly visiblePosts = computed<Post[]>(() => {
    const posts = this.posts.hasValue() ? this.posts.value() : [];
    const interests = this.selectedInterests();

    if (this.selectedCategory() !== ALL_CATEGORIES || interests.length === 0) {
      return posts;
    }

    return posts.filter(
      post => isInterestCategory(post.category) && interests.includes(post.category)
    );
  });

  async ngOnInit(): Promise<void> {
    try {
      this.selectedInterests.set(await this.interestService.getInterests());
    } catch (error) {
      console.error('Interessen konnten nicht geladen werden:', error);
      this.message.set('Deine Interessen konnten nicht geladen werden.');
    } finally {
      this.interestsLoading.set(false);
    }
  }

  async toggleInterest(category: InterestCategory): Promise<void> {
    const current = this.selectedInterests();
    const next = current.includes(category)
      ? current.filter(item => item !== category)
      : [...current, category];

    this.interestsSaving.set(true);
    this.message.set('');

    try {
      await this.interestService.saveInterests(next);
      this.selectedInterests.set(next);
    } catch (error) {
      console.error('Interessen konnten nicht gespeichert werden:', error);
      this.message.set('Deine Interessen konnten nicht gespeichert werden.');
    } finally {
      this.interestsSaving.set(false);
    }
  }

  selectCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Abmeldung fehlgeschlagen:', error);
      this.message.set('Abmelden ist fehlgeschlagen.');
    }
  }
}
