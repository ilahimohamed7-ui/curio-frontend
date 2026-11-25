import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { Post } from '../../data/post.model';
import { PostCard } from './post-card';

describe('PostCard', () => {
  const post: Post = {
    id: '1',
    category: 'Wissenschaft',
    title: 'Saturn könnte auf Wasser schwimmen',
    description: 'Saturn hat eine geringere mittlere Dichte als Wasser.',
    source: 'NASA',
    emoji: '🪐',
    likes: 248,
    comments: 32,
    color: 'blue'
  };

  function render() {
    const fixture = TestBed.createComponent(PostCard);
    fixture.componentRef.setInput('post', post);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('zeigt Titel, Beschreibung, Kategorie und Quelle', () => {
    const element = render();

    expect(element.querySelector('h3')?.textContent).toContain(post.title);
    expect(element.textContent).toContain(post.description);
    expect(element.textContent).toContain('Wissenschaft');
    expect(element.textContent).toContain('NASA');
  });

  it('setzt die Farbklasse für den Akzent', () => {
    const card = render().querySelector('.post-card');

    expect(card?.classList).toContain('post-card');
    expect(card?.classList).toContain('blue');
  });

  it('beschriftet Likes und Kommentare für Screenreader', () => {
    const element = render();

    expect(element.textContent).toContain('Gefällt-mir-Angaben:');
    expect(element.textContent).toContain('248');
    expect(element.textContent).toContain('Kommentare:');
    expect(element.textContent).toContain('32');
  });
});
