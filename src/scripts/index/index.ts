// ============================================
// Index Page - Main Entry Point
// ============================================

import { initFavorites } from './favorites';
import { initSearch } from './search';
import { initSectionToggle } from './section-toggle';

// Export types for external use
export type { FavoriteItem, I18nData } from './types';
export { FAVORITES_KEY, SECTIONS_STATE_KEY } from './types';

// Export utility functions
export {
  getI18nData,
  getFavorites,
  saveFavorites,
  getSectionStates,
  saveSectionState,
} from './utils';

// Export individual modules
export { initFavorites } from './favorites';
export { initSearch } from './search';
export { initSectionToggle } from './section-toggle';

// Initialize all modules when DOM is ready
export function initIndexPage(): void {
  initFavorites();
  initSearch();
  initSectionToggle();
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initIndexPage);
