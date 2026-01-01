// ============================================
// Types & Constants for Index Page
// ============================================

export interface FavoriteItem {
  url: string;
  title: string;
  icon: string;
}

export interface I18nData {
  noResult: string;
  found: string;
  empty: string;
  lang: string;
}

export const FAVORITES_KEY = 'favorite-tools';
export const SECTIONS_STATE_KEY = 'index-sections-state';
