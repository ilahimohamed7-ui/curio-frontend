import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { InterestCategory } from '../../data/category';
import { InterestPicker } from './interest-picker';

describe('InterestPicker', () => {
  function setup(selected: InterestCategory[] = [], disabled = false) {
    const fixture = TestBed.createComponent(InterestPicker);
    fixture.componentRef.setInput('options', [
      'Wissenschaft',
      'Technologie',
      'Psychologie'
    ]);
    fixture.componentRef.setInput('selected', selected);
    fixture.componentRef.setInput('disabled', disabled);
    fixture.detectChanges();

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    );
    return { fixture, buttons };
  }

  it('zeigt eine Schaltfläche pro Kategorie', () => {
    const { buttons } = setup();

    expect(buttons.map(b => b.textContent?.trim())).toEqual([
      'Wissenschaft',
      'Technologie',
      'Psychologie'
    ]);
  });

  it('markiert ausgewählte Kategorien über aria-pressed', () => {
    const { buttons } = setup(['Technologie']);

    expect(buttons.map(b => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false'
    ]);
  });

  it('meldet einen Klick über das toggled-Output', () => {
    const { fixture, buttons } = setup();
    const emitted: InterestCategory[] = [];
    fixture.componentInstance.toggled.subscribe(value => emitted.push(value));

    buttons[2].click();

    expect(emitted).toEqual(['Psychologie']);
  });

  it('sperrt alle Schaltflächen, wenn disabled gesetzt ist', () => {
    const { buttons } = setup([], true);

    expect(buttons.every(b => b.disabled)).toBe(true);
  });
});
