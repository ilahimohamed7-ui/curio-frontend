
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PostRepository } from './post.repository';
import { Post } from './post.model';

@Injectable()
export class InMemoryPostRepository extends PostRepository {
  private readonly posts: Post[] = [
    {
      id: '1',
      category: 'Wissenschaft',
      title: 'Saturn könnte auf Wasser schwimmen',
      description:
        'Saturn hat eine geringere mittlere Dichte als Wasser. Er besteht überwiegend aus Wasserstoff und Helium.',
      source: 'NASA – Solar System Exploration',
      emoji: '🪐',
      likes: 248,
      comments: 32,
      color: 'purple',
      createdAt: '2026-11-01T08:00:00Z',
      aiGenerated: false
    },
    {
      id: '2',
      category: 'Psychologie',
      title: 'Warum liebt unser Gehirn Geschichten?',
      description:
        'Geschichten bringen Informationen in einen verständlichen Zusammenhang und können helfen, Inhalte zu behalten.',
      source: 'Kognitionspsychologie',
      emoji: '🧠',
      likes: 186,
      comments: 24,
      color: 'blue',
      createdAt: '2026-11-01T08:00:00Z',
      aiGenerated: false
    },
    {
      id: '3',
      category: 'Technologie',
      title: 'Wie lernt künstliche Intelligenz?',
      description:
        'Viele KI-Modelle lernen Muster aus Beispieldaten. Ihre Qualität hängt unter anderem von den Daten und Trainingsverfahren ab.',
      source: 'Grundlagen des maschinellen Lernens',
      emoji: '🤖',
      likes: 312,
      comments: 47,
      color: 'orange',
      createdAt: '2026-11-01T08:00:00Z',
      aiGenerated: false
    }
  ];


override getPosts(): Observable<Post[]> {
  return of(this.posts.map(post => ({ ...post })));
}

override getPostsByCategory(
  category: string
): Observable<Post[]> {
  const posts = this.getPosts();

  if (category === 'Alle') {
    return posts;
  }

  return posts.pipe(
    // Hier filtern wir die Liste, sobald sie geliefert wird.
    map(items => items.filter(post => post.category === category))
  );
}
}
