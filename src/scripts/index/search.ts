// ============================================
// Search Module
// ============================================

import { getI18nData } from './utils';

export function initSearch(): void {
  const i18n = getI18nData();
  const searchInput = document.getElementById('tool-search') as HTMLInputElement | null;
  const resultsCount = document.getElementById('search-results-count');
  const allSections = document.querySelectorAll<HTMLElement>(
    '#index .section:not(#my-tools-card):not(#search-section)'
  );

  if (!searchInput || !resultsCount) {
    return;
  }

  function performSearch(): void {
    const searchTerm = searchInput!.value.toLowerCase().trim();
    let totalVisible = 0;

    if (!searchTerm) {
      // Show all sections, blocks, and items
      allSections.forEach((section) => {
        section.style.display = '';
        section.querySelectorAll<HTMLElement>('.block').forEach((block) => {
          block.style.display = '';
          block.querySelectorAll<HTMLElement>('li').forEach((item) => {
            item.style.display = '';
          });
        });
      });
      resultsCount!.textContent = '';
      return;
    }

    // Filter sections and items
    allSections.forEach((section) => {
      const sectionTitle = section.querySelector('h2')?.textContent?.toLowerCase() || '';
      let sectionHasVisibleItems = false;

      section.querySelectorAll<HTMLElement>('.block').forEach((block) => {
        const blockTitle = block.querySelector('h3')?.textContent?.toLowerCase() || '';
        let blockHasVisibleItems = false;

        block.querySelectorAll<HTMLElement>('li').forEach((item) => {
          const link = item.querySelector('a');
          if (!link) {
            return;
          }

          const toolName = link.textContent?.toLowerCase() || '';
          const isMatch =
            toolName.includes(searchTerm) ||
            blockTitle.includes(searchTerm) ||
            sectionTitle.includes(searchTerm);

          if (isMatch) {
            item.style.display = '';
            blockHasVisibleItems = true;
            sectionHasVisibleItems = true;
            totalVisible++;
          } else {
            item.style.display = 'none';
          }
        });

        block.style.display = blockHasVisibleItems ? '' : 'none';
      });

      section.style.display = sectionHasVisibleItems ? '' : 'none';
    });

    // Update results count
    if (totalVisible === 0) {
      resultsCount!.innerHTML = `<span style="color: var(--var-red);">${i18n.noResult}</span>`;
    } else {
      const text = i18n.found
        .replace('{0}', String(totalVisible))
        .replace('{1}', totalVisible !== 1 ? 's' : '');
      resultsCount!.innerHTML = `<span style="color: var(--var-primary);">${text}</span>`;
    }
  }

  searchInput.addEventListener('input', performSearch);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Focus search on Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }

    // Clear search on Escape
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      performSearch();
      searchInput.blur();
    }
  });
}
