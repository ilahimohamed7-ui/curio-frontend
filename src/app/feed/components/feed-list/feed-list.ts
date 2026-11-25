

import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';

import { FeedService } from '../../services/feed.service';
import { Post } from '../../models/post.model';
import { AuthService } from '../../../core/auth/auth.service';
import {
  InterestService,
  InterestCategory
} from '../../services/interest.service';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './feed-list.html',
  styleUrl: './feed-list.css'
})
export class FeedList implements OnInit {
  posts$!: Observable<Post[]>;

  readonly categories = [
    'Alle',
    'Wissenschaft',
    'Technologie',
    'Psychologie'
  ];

  readonly interestCategories: InterestCategory[] = [
    'Wissenschaft',
    'Technologie',
    'Psychologie'
  ];

  selectedCategory = 'Alle';
  selectedInterests: InterestCategory[] = [];

  interestsLoading = true;
  interestsSaving = false;
  message = '';

  constructor(
    private readonly feedService: FeedService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly interestService: InterestService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.selectedInterests =
        await this.interestService.getInterests();
    } catch (error) {
      console.error('Interessen konnten nicht geladen werden:', error);
      this.message = 'Deine Interessen konnten nicht geladen werden.';
    } finally {
      this.interestsLoading = false;
    }

    this.loadPosts();
  }

  async toggleInterest(category: InterestCategory): Promise<void> {
    const wasSelected = this.selectedInterests.includes(category);

    const nextInterests = wasSelected
      ? this.selectedInterests.filter(item => item !== category)
      : [...this.selectedInterests, category];

    this.interestsSaving = true;
    this.message = '';

    try {
      await this.interestService.saveInterests(nextInterests);
      this.selectedInterests = nextInterests;
      this.loadPosts();
    } catch (error) {
      console.error('Interessen konnten nicht gespeichert werden:', error);
      this.message = 'Deine Interessen konnten nicht gespeichert werden.';
    } finally {
      this.interestsSaving = false;
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.loadPosts();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Abmeldung fehlgeschlagen:', error);
      this.message = 'Abmelden ist fehlgeschlagen.';
    }
  }

  private loadPosts(): void {
    this.posts$ = this.feedService.getPostsByCategory(
      this.selectedCategory
    ).pipe(
      map(posts => {
        if (this.selectedCategory !== 'Alle') {
          return posts;
        }

        if (this.selectedInterests.length === 0) {
          return posts;
        }

        return posts.filter(post =>
          this.selectedInterests.includes(
            post.category as InterestCategory
          )
        );
      })
    );
  }
}
