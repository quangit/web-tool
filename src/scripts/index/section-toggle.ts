// ============================================
// Section Collapse Module
// ============================================

import { getSectionStates, saveSectionState } from './utils';

export function initSectionToggle(): void {
  const sections = document.querySelectorAll<HTMLElement>('#index .section[data-section]');
  const savedStates = getSectionStates();

  sections.forEach((section) => {
    const sectionId = section.dataset.section;
    const toggleBtn = section.querySelector<HTMLButtonElement>('.section-toggle');
    const content = section.querySelector<HTMLElement>('.section-content');

    if (!toggleBtn || !content || !sectionId) {
      return;
    }

    // Apply saved state or default to expanded
    const isExpanded = savedStates[sectionId] !== false;
    toggleBtn.setAttribute('aria-expanded', String(isExpanded));
    if (!isExpanded) {
      content.style.display = 'none';
    }

    toggleBtn.addEventListener('click', () => {
      const currentState = toggleBtn.getAttribute('aria-expanded') === 'true';
      const newState = !currentState;

      toggleBtn.setAttribute('aria-expanded', String(newState));
      content.style.display = newState ? '' : 'none';
      saveSectionState(sectionId, newState);
    });
  });
}
