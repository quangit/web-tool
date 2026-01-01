// ============================================
// User Tools Renderer
// ============================================

import { getUserCards, type UserCard, type UserToolItem } from './user-tools-storage';
import {
  initPopups,
  openAddCardPopup,
  openEditCardPopup,
  openAddItemPopup,
  openEditItemPopup,
  confirmDeleteCard,
  confirmDeleteItem,
  type PopupI18n,
} from './popups';
import { getI18nData } from './utils';

let userToolsContainer: HTMLElement | null = null;
let currentLang = 'en';

export interface UserToolsI18n {
  title: string;
  addCard: string;
  addItem: string;
  edit: string;
  delete: string;
  deleteConfirm: string;
  empty: string;
  popup: PopupI18n;
}

export function initUserTools(): void {
  const i18nData = getI18nData();
  currentLang = i18nData.lang || 'en';

  // Get i18n from the page
  const i18n = getUserToolsI18n();

  // Initialize popups
  initPopups(i18n.popup, {
    onCardAdded: () => renderUserTools(),
    onCardUpdated: () => renderUserTools(),
    onCardDeleted: () => renderUserTools(),
    onItemAdded: () => renderUserTools(),
    onItemUpdated: () => renderUserTools(),
    onItemDeleted: () => renderUserTools(),
  });

  // Setup button listeners
  setupButtonListeners();

  // Initial render
  renderUserTools();
}

function getUserToolsI18n(): UserToolsI18n {
  const script = document.getElementById('user-tools-i18n');
  if (script?.textContent) {
    try {
      return JSON.parse(script.textContent);
    } catch {
      // Fall through to defaults
    }
  }

  // Defaults (English)
  return {
    title: 'My Custom Tools',
    addCard: 'Add Card',
    addItem: 'Add Item',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this?',
    empty: 'No custom tools yet. Click "Add Card" to create your first card!',
    popup: {
      addCard: 'Add New Card',
      editCard: 'Edit Card',
      cardName: 'Card Name',
      cardNamePlaceholder: 'Enter card name...',
      addItem: 'Add New Item',
      editItem: 'Edit Item',
      selectCard: 'Select Card',
      selectCardPlaceholder: 'Choose a card...',
      icon: 'Icon',
      iconPlaceholder: 'Click to select icon...',
      title: 'Title',
      titlePlaceholder: 'Enter item title...',
      description: 'Description',
      descriptionPlaceholder: 'Enter item description...',
      url: 'URL',
      urlPlaceholder: 'Enter URL (e.g., https://example.com)...',
      openNewWindow: 'Open in new window',
      save: 'Save',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this?',
      iconPickerTitle: 'Select Icon',
      iconPickerSearch: 'Search icons...',
      iconPickerNoResult: 'No icons found',
    },
  };
}

function setupButtonListeners(): void {
  // Add Card button
  document.getElementById('btn-add-card')?.addEventListener('click', () => {
    openAddCardPopup();
  });

  // Add Item button
  document.getElementById('btn-add-item')?.addEventListener('click', () => {
    openAddItemPopup();
  });
}

export function renderUserTools(): void {
  userToolsContainer = document.getElementById('user-cards-container');
  if (!userToolsContainer) {
    return;
  }

  const cards = getUserCards();
  const i18n = getUserToolsI18n();

  if (cards.length === 0) {
    userToolsContainer.innerHTML = `<div class="empty-state">${i18n.empty}</div>`;
    userToolsContainer.classList.remove('blocks');
    return;
  }

  userToolsContainer.classList.add('blocks');
  userToolsContainer.innerHTML = cards.map((card) => renderCard(card, i18n)).join('');

  // Re-initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Setup event listeners for cards
  setupCardEventListeners();
}

function renderCard(card: UserCard, i18n: UserToolsI18n): string {
  const itemsHtml =
    card.items.length > 0 ? card.items.map((item) => renderItem(card.id, item, i18n)).join('') : '';

  return `
    <div class="block user-card" data-card-id="${card.id}">
      <h3>
        <span class="card-title-text">${escapeHtml(card.title)}</span>
        <div class="user-card-actions">
          <button class="edit-card-btn" title="${i18n.edit}" data-card-id="${card.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="delete-card-btn delete-btn" title="${i18n.delete}" data-card-id="${card.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </h3>
      <nav>
        <ol class="user-card-items">
          ${itemsHtml}
        </ol>
      </nav>
    </div>
  `;
}

function renderItem(cardId: string, item: UserToolItem, i18n: UserToolsI18n): string {
  // Determine the href based on openNewWindow setting
  let href: string;
  let dataOpenNewWindow = '';

  if (item.openNewWindow) {
    href = item.url;
    dataOpenNewWindow = 'data-open-new-window="true"';
  } else {
    // Link to external page with iframe
    href = `/${currentLang}/external?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}&description=${encodeURIComponent(item.description)}`;
  }

  return `
    <li data-item-id="${item.id}">
      <a href="${escapeHtml(href)}" ${dataOpenNewWindow}>
        <i data-lucide="${item.icon}" class="tool-icon"></i>
        <span>${escapeHtml(item.title)}</span>
      </a>
      <div class="item-actions">
        <button class="edit-item-btn" title="${i18n.edit}" data-card-id="${cardId}" data-item-id="${item.id}">
          <i data-lucide="pencil"></i>
        </button>
        <button class="delete-item-btn delete-btn" title="${i18n.delete}" data-card-id="${cardId}" data-item-id="${item.id}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </li>
  `;
}

function setupCardEventListeners(): void {
  if (!userToolsContainer) {
    return;
  }

  // Handle links that should open in new window
  userToolsContainer.querySelectorAll('a[data-open-new-window="true"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = (link as HTMLAnchorElement).href;
      // Open in a new window (not tab) with specific dimensions
      const width = 1024;
      const height = 768;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      window.open(
        url,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`
      );
    });
  });

  // Edit card buttons
  userToolsContainer.querySelectorAll('.edit-card-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cardId = (btn as HTMLElement).dataset.cardId;
      const cardEl = btn.closest('.user-card');
      const title = cardEl?.querySelector('h3')?.textContent || '';
      if (cardId) {
        openEditCardPopup(cardId, title);
      }
    });
  });

  // Delete card buttons
  userToolsContainer.querySelectorAll('.delete-card-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cardId = (btn as HTMLElement).dataset.cardId;
      if (cardId) {
        confirmDeleteCard(cardId);
      }
    });
  });

  // Edit item buttons
  userToolsContainer.querySelectorAll('.edit-item-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cardId = (btn as HTMLElement).dataset.cardId;
      const itemId = (btn as HTMLElement).dataset.itemId;
      if (cardId && itemId) {
        const cards = getUserCards();
        const card = cards.find((c) => c.id === cardId);
        const item = card?.items.find((i) => i.id === itemId);
        if (item) {
          openEditItemPopup(cardId, item);
        }
      }
    });
  });

  // Delete item buttons
  userToolsContainer.querySelectorAll('.delete-item-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cardId = (btn as HTMLElement).dataset.cardId;
      const itemId = (btn as HTMLElement).dataset.itemId;
      if (cardId && itemId) {
        confirmDeleteItem(cardId, itemId);
      }
    });
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
