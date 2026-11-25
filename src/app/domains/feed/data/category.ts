/**
 * Einzige Quelle für die verfügbaren Themen-Kategorien im Frontend.
 *
 * Muss mit der Prüfung in der Datenbankfunktion `save_user_interests`
 * (supabase/migrations) übereinstimmen.
 */
export const INTEREST_CATEGORIES = [
  'Wissenschaft',
  'Technologie',
  'Psychologie'
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

/** Filteroption im Feed: alle Beiträge oder eine bestimmte Kategorie. */
export const ALL_CATEGORIES = 'Alle';

export type CategoryFilter = typeof ALL_CATEGORIES | InterestCategory;

export const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  ALL_CATEGORIES,
  ...INTEREST_CATEGORIES
];

export function isInterestCategory(value: unknown): value is InterestCategory {
  return (INTEREST_CATEGORIES as readonly unknown[]).includes(value);
}
