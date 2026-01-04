// ============================================
// Utility Functions for Index Page
// ============================================

import type { FavoriteItem, I18nData } from './types';
import { FAVORITES_KEY, SECTIONS_STATE_KEY } from './types';

export function getI18nData(): I18nData {
  const script = document.getElementById('i18n-data');
  if (!script?.textContent) {
    return { noResult: 'No tools found', found: 'Found {0} tool{1}', empty: '', lang: 'en' };
  }
  return JSON.parse(script.textContent);
}

export function getFavorites(): FavoriteItem[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteItem[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function getSectionStates(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(SECTIONS_STATE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveSectionState(sectionId: string, isExpanded: boolean): void {
  const states = getSectionStates();
  states[sectionId] = isExpanded;
  localStorage.setItem(SECTIONS_STATE_KEY, JSON.stringify(states));
}
