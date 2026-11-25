import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { FeedPage } from './feed-page';
import { PostRepository } from '../data/post.repository';
import { Post } from '../data/post.model';
import { AuthService } from '../../../core/auth/auth.service';
import { InterestService } from '../data/interest.service';
import { Router, provideRouter } from '@angular/router';

describe('FeedPage', () => {
  const samplePosts: Post[] = [
    {
      id: '1',
      category: 'Wissenschaft',
      title: 'Saturn könnte auf Wasser schwimmen',
      description: 'Saturn hat eine geringere mittlere Dichte als Wasser.',
      source: 'NASA',
      emoji: '🪐',
      likes: 248,
      comments: 32,
      color: 'purple',
      createdAt: '2026-11-01T08:00:00Z',
      aiGenerated: false
    },
    {
      id: '2',
      category: 'Technologie',
      title: 'Wie lernt künstliche Intelligenz?',
      description: 'KI-Modelle lernen Muster aus Daten.',
      source: 'Grundlagen des maschinellen Lernens',
      emoji: '🤖',
      likes: 312,
      comments: 47,
      color: 'orange',
      createdAt: '2026-11-01T08:00:00Z',
      aiGenerated: false
    },
    {
      id: '3',
      category: 'Psychologie',
      title: 'Warum liebt unser Gehirn Geschichten?',
      description: 'Geschichten helfen, Informationen einzuordnen.',
      source: 'Kognitionspsychologie',
      emoji: '🧠',
      likes: 186,
      comments: 24,
      color: 'blue',
      createdAt: '2026-11-01T08:00:00Z',
      aiGenerated: false
    }
  ];

  const mockRepository = {
    getPosts: vi.fn(() => of(samplePosts)),
    getPostsByCategory: vi.fn((category: string) =>
      of(
        category === 'Alle'
          ? samplePosts
          : samplePosts.filter(post => post.category === category)
      )
    )
  };
  const mockAuthService = { logout: vi.fn().mockResolvedValue(undefined) };
  let navigateSpy: ReturnType<typeof vi.spyOn>;
  const mockInterestService = {
    getInterests: vi.fn().mockResolvedValue([]),
    saveInterests: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [FeedPage],
      providers: [
        { provide: PostRepository, useValue: mockRepository },
        { provide: AuthService, useValue: mockAuthService },
        { provide: InterestService, useValue: mockInterestService },
        provideRouter([])
      ]
    }).compileComponents();

    navigateSpy = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
  });

  /** Rendert die Seite und wartet, bis Interessen und Beiträge geladen sind. */
  async function render(fixture: ComponentFixture<FeedPage>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function createFeed() {
    const fixture = TestBed.createComponent(FeedPage);
    await render(fixture);
    return fixture;
  }

  it('zeigt die Beiträge aus dem FeedService als Post-Cards an', async () => {
    const fixture = await createFeed();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(mockRepository.getPostsByCategory).toHaveBeenCalledWith('Alle');
    expect(compiled.querySelectorAll('.post-card')).toHaveLength(3);
    expect(compiled.textContent).toContain('Saturn könnte auf Wasser schwimmen');
    expect(compiled.textContent).toContain('Wie lernt künstliche Intelligenz?');
  });

  it('bietet alle vier Kategorien zur Auswahl an', async () => {
    const fixture = await createFeed();
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '.category-options button'
      )
    ).map(button => button.textContent?.trim());

    expect(buttons).toEqual([
      'Alle',
      'Wissenschaft',
      'Technologie',
      'Psychologie'
    ]);
  });

  it('lädt beim Filtern die ausgewählte Kategorie über den FeedService', async () => {
    const fixture = await createFeed();
    const compiled = fixture.nativeElement as HTMLElement;
    const technologyButton = compiled.querySelector(
      '.category-options button:nth-child(3)'
    ) as HTMLButtonElement;

    technologyButton.click();
    await render(fixture);

    expect(mockRepository.getPostsByCategory).toHaveBeenCalledWith('Technologie');
    expect(compiled.querySelectorAll('.post-card')).toHaveLength(1);
    expect(compiled.textContent).toContain('Wie lernt künstliche Intelligenz?');
  });

  it('zeigt bei "Alle" nur Beiträge aus den eigenen Interessen', async () => {
    mockInterestService.getInterests.mockResolvedValueOnce(['Psychologie']);

    const fixture = await createFeed();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.post-card')).toHaveLength(1);
    expect(compiled.textContent).toContain('Warum liebt unser Gehirn Geschichten?');
  });

  it('zeigt eine Fehlermeldung mit "Erneut versuchen", wenn das Laden scheitert', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRepository.getPostsByCategory.mockReturnValueOnce(
      throwError(() => new Error('Netzwerk'))
    );

    const fixture = await createFeed();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Beiträge konnten nicht geladen werden.');
    expect(compiled.querySelector('.retry-button')).toBeTruthy();
    expect(compiled.querySelectorAll('.post-card')).toHaveLength(0);
  });

  it('meldet über die vorhandene logout-Methode ab', async () => {
    const fixture = await createFeed();
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('.logout-button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(mockAuthService.logout).toHaveBeenCalledOnce();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
