import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

import { CategoryFilter as CategoryFilterBar } from '../ui/category-filter/category-filter';
import { InterestPicker } from '../ui/interest-picker/interest-picker';
import { PostCard } from '../ui/post-card/post-card';

import { FeedService } from '../data/feed.service';
import { Post } from '../data/post.model';
import { AuthService } from '../../../core/auth/auth.service';
import {
  InterestCategory,
  InterestService
} from '../data/interest.service';
import {
  ALL_CATEGORIES,
  CATEGORY_FILTERS,
  CategoryFilter,
  INTEREST_CATEGORIES,
  isInterestCategory
} from '../data/category';

@Component({
  selector: 'app-feed-page',
  imports: [AsyncPipe, RouterLink, CategoryFilterBar, InterestPicker, PostCard],
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

  readonly posts$ = signal<Observable<Post[]>>(of([]));
  readonly postsError = signal(false);
  readonly selectedCategory = signal<CategoryFilter>(ALL_CATEGORIES);
  readonly selectedInterests = signal<InterestCategory[]>([]);
  readonly interestsLoading = signal(true);
  readonly interestsSaving = signal(false);
  readonly message = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.selectedInterests.set(await this.interestService.getInterests());
    } catch (error) {
      console.error('Interessen konnten nicht geladen werden:', error);
      this.message.set('Deine Interessen konnten nicht geladen werden.');
    } finally {
      this.interestsLoading.set(false);
    }

    this.loadPosts();
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
      this.loadPosts();
    } catch (error) {
      console.error('Interessen konnten nicht gespeichert werden:', error);
      this.message.set('Deine Interessen konnten nicht gespeichert werden.');
    } finally {
      this.interestsSaving.set(false);
    }
  }

  selectCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
    this.loadPosts();
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

  private loadPosts(): void {
    const category = this.selectedCategory();
    const interests = this.selectedInterests();

    this.postsError.set(false);
    this.posts$.set(
      this.feedService.getPostsByCategory(category).pipe(
        map(posts =>
          category !== ALL_CATEGORIES || interests.length === 0
            ? posts
            : posts.filter(post =>
                isInterestCategory(post.category) &&
                interests.includes(post.category)
              )
        ),
        catchError(error => {
          console.error('Beiträge konnten nicht geladen werden:', error);
          this.postsError.set(true);
          return of([]);
        })
      )
    );
  }
}
