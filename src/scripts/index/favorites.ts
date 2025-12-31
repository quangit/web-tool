// ============================================
// Favorites Module
// ============================================

import { getI18nData, getFavorites, saveFavorites } from './utils';

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}

export function initFavorites(): void {
  const i18n = getI18nData();
  const list = document.getElementById('favorite-tools-list');

  function toggleFavorite(url: string, title: string, icon: string): void {
    const favorites = getFavorites();
    const index = favorites.findIndex((f) => f.url === url);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push({ url, title, icon });
    }

    saveFavorites(favorites);
    updateFavoritesList();
    updateHeartIcons();
  }

  function updateFavoritesList(): void {
    if (!list) {
      return;
    }

    const favorites = getFavorites();

    if (favorites.length === 0) {
      list.innerHTML = `<li class="empty-state">${i18n.empty}</li>`;
      return;
    }

    list.innerHTML = favorites
      .map(
        (fav) => `
          <li>
            <a href="/${i18n.lang}/${fav.url}">
              ${fav.icon ? `<i data-lucide="${fav.icon}" class="tool-icon"></i>` : ''}
              <span>${fav.title}</span>
            </a>
            <span
              class="favorite-toggle active"
              data-url="${fav.url}"
              data-title="${fav.title}"
              data-icon="${fav.icon || ''}"
            ></span>
          </li>
        `
      )
      .join('');

    // Re-initialize Lucide icons after DOM update
    requestAnimationFrame(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });

    // Attach event listeners to favorite toggles
    list.querySelectorAll<HTMLElement>('.favorite-toggle').forEach((toggle) => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(
          toggle.dataset.url || '',
          toggle.dataset.title || '',
          toggle.dataset.icon || ''
        );
      });
    });
  }

  function updateHeartIcons(): void {
    const favoriteUrls = getFavorites().map((f) => f.url);

    document.querySelectorAll<HTMLElement>('#index .favorite-toggle').forEach((toggle) => {
      const isFavorite = favoriteUrls.includes(toggle.dataset.url || '');
      toggle.classList.toggle('active', isFavorite);
    });
  }

  // Add heart icons to all tool links (except in My Tools card)
  document.querySelectorAll<HTMLElement>('#index .section:not(#my-tools-card) li').forEach((li) => {
    const link = li.querySelector<HTMLAnchorElement>('a');
    if (!link) {
      return;
    }

    const rawUrl = new URL(link.href).pathname;
    const url = rawUrl.startsWith(`/${i18n.lang}/`)
      ? rawUrl.substring(`/${i18n.lang}/`.length)
      : rawUrl.substring(1);

    const itemName = link.querySelector('span')?.textContent || link.textContent || '';
    // Look for both original <i> element and rendered <svg> by lucide
    const iconElement =
      link.querySelector<HTMLElement>('i[data-lucide]') ||
      link.querySelector<HTMLElement>('svg[data-lucide]') ||
      link.querySelector<HTMLElement>('.lucide');
    const icon = iconElement?.getAttribute('data-lucide') || '';

    // Get category from the block's h3 element
    const block = li.closest('.block');
    const category = block?.querySelector('h3')?.textContent || '';
    const title = category ? `${category}: ${itemName}` : itemName;

    const heart = document.createElement('span');
    heart.className = 'favorite-toggle';
    heart.dataset.url = url;
    heart.dataset.title = title;
    heart.dataset.icon = icon;

    heart.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(url, title, icon);
    });

    li.appendChild(heart);
  });

  updateFavoritesList();
  updateHeartIcons();
}
