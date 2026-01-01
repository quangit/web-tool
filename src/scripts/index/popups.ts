// ============================================
// User Tools Popups
// ============================================

import {
  getUserCards,
  addCard,
  updateCard,
  deleteCard,
  addItem,
  updateItem,
  deleteItem,
  type UserCard,
  type UserToolItem,
} from './user-tools-storage';
import { openIconPicker } from './icon-picker';

export interface PopupI18n {
  addCard: string;
  editCard: string;
  cardName: string;
  cardNamePlaceholder: string;
  addItem: string;
  editItem: string;
  selectCard: string;
  selectCardPlaceholder: string;
  icon: string;
  iconPlaceholder: string;
  title: string;
  titlePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  url: string;
  urlPlaceholder: string;
  openNewWindow: string;
  save: string;
  cancel: string;
  deleteConfirm: string;
  iconPickerTitle: string;
  iconPickerSearch: string;
  iconPickerNoResult: string;
}

export interface PopupCallbacks {
  onCardAdded?: (card: UserCard) => void;
  onCardUpdated?: (card: UserCard) => void;
  onCardDeleted?: (cardId: string) => void;
  onItemAdded?: (cardId: string, item: UserToolItem) => void;
  onItemUpdated?: (cardId: string, item: UserToolItem) => void;
  onItemDeleted?: (cardId: string, itemId: string) => void;
}

let cardPopupOverlay: HTMLElement | null = null;
let itemPopupOverlay: HTMLElement | null = null;
let currentI18n: PopupI18n | null = null;
let currentCallbacks: PopupCallbacks = {};

// Initialize popups
export function initPopups(i18n: PopupI18n, callbacks: PopupCallbacks): void {
  currentI18n = i18n;
  currentCallbacks = callbacks;

  // Create popup DOM elements
  createCardPopup();
  createItemPopup();
}

// ============================================
// Card Popup
// ============================================

function createCardPopup(): void {
  if (!currentI18n) {
    return;
  }

  cardPopupOverlay = document.createElement('div');
  cardPopupOverlay.className = 'popup-overlay';
  cardPopupOverlay.id = 'card-popup';
  cardPopupOverlay.innerHTML = `
    <div class="popup-modal">
      <div class="popup-header">
        <h3 class="popup-title">${currentI18n.addCard}</h3>
        <button class="popup-close" type="button" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="popup-body">
        <form id="card-form">
          <input type="hidden" name="cardId" />
          <div class="form-group">
            <label for="card-name">${currentI18n.cardName}</label>
            <input type="text" id="card-name" name="cardName" placeholder="${currentI18n.cardNamePlaceholder}" required />
          </div>
        </form>
      </div>
      <div class="popup-footer">
        <button type="button" class="btn-secondary popup-cancel">${currentI18n.cancel}</button>
        <button type="submit" form="card-form" class="btn-primary">${currentI18n.save}</button>
      </div>
    </div>
  `;

  document.body.appendChild(cardPopupOverlay);

  // Event listeners
  cardPopupOverlay.querySelector('.popup-close')?.addEventListener('click', closeCardPopup);
  cardPopupOverlay.querySelector('.popup-cancel')?.addEventListener('click', closeCardPopup);
  cardPopupOverlay.addEventListener('click', (e) => {
    if (e.target === cardPopupOverlay) {
      closeCardPopup();
    }
  });

  const form = cardPopupOverlay.querySelector<HTMLFormElement>('#card-form');
  form?.addEventListener('submit', handleCardSubmit);
}

export function openAddCardPopup(): void {
  if (!cardPopupOverlay || !currentI18n) {
    return;
  }

  // Reset form
  const form = cardPopupOverlay.querySelector<HTMLFormElement>('#card-form');
  form?.reset();

  // Update title
  const title = cardPopupOverlay.querySelector('.popup-title');
  if (title) {
    title.textContent = currentI18n.addCard;
  }

  // Clear card ID (for new card)
  const cardIdInput = cardPopupOverlay.querySelector<HTMLInputElement>('input[name="cardId"]');
  if (cardIdInput) {
    cardIdInput.value = '';
  }

  // Show popup
  cardPopupOverlay.classList.add('active');
  cardPopupOverlay.querySelector<HTMLInputElement>('#card-name')?.focus();
}

export function openEditCardPopup(cardId: string, currentTitle: string): void {
  if (!cardPopupOverlay || !currentI18n) {
    return;
  }

  // Update title
  const title = cardPopupOverlay.querySelector('.popup-title');
  if (title) {
    title.textContent = currentI18n.editCard;
  }

  // Set card ID and name
  const cardIdInput = cardPopupOverlay.querySelector<HTMLInputElement>('input[name="cardId"]');
  const cardNameInput = cardPopupOverlay.querySelector<HTMLInputElement>('#card-name');
  if (cardIdInput) {
    cardIdInput.value = cardId;
  }
  if (cardNameInput) {
    cardNameInput.value = currentTitle;
  }

  // Show popup
  cardPopupOverlay.classList.add('active');
  cardNameInput?.focus();
}

function closeCardPopup(): void {
  cardPopupOverlay?.classList.remove('active');
}

function handleCardSubmit(e: Event): void {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const cardId = formData.get('cardId') as string;
  const cardName = formData.get('cardName') as string;

  if (!cardName.trim()) {
    return;
  }

  if (cardId) {
    // Update existing card
    const card = updateCard(cardId, cardName.trim());
    if (card) {
      currentCallbacks.onCardUpdated?.(card);
    }
  } else {
    // Add new card
    const card = addCard(cardName.trim());
    currentCallbacks.onCardAdded?.(card);
  }

  closeCardPopup();
}

// ============================================
// Item Popup
// ============================================

let selectedIcon = '';

function createItemPopup(): void {
  if (!currentI18n) {
    return;
  }

  itemPopupOverlay = document.createElement('div');
  itemPopupOverlay.className = 'popup-overlay';
  itemPopupOverlay.id = 'item-popup';
  itemPopupOverlay.innerHTML = `
    <div class="popup-modal">
      <div class="popup-header">
        <h3 class="popup-title">${currentI18n.addItem}</h3>
        <button class="popup-close" type="button" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="popup-body">
        <form id="item-form">
          <input type="hidden" name="itemId" />
          <input type="hidden" name="originalCardId" />
          <input type="hidden" name="selectedIcon" />
          
          <div class="form-group">
            <label for="item-card">${currentI18n.selectCard}</label>
            <select id="item-card" name="cardId" required>
              <option value="">${currentI18n.selectCardPlaceholder}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>${currentI18n.icon}</label>
            <div class="icon-input-wrapper">
              <div class="icon-input" id="icon-input">
                <span class="selected-icon"></span>
                <span class="placeholder">${currentI18n.iconPlaceholder}</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="item-title">${currentI18n.title}</label>
            <input type="text" id="item-title" name="title" placeholder="${currentI18n.titlePlaceholder}" required />
          </div>
          
          <div class="form-group">
            <label for="item-description">${currentI18n.description}</label>
            <textarea id="item-description" name="description" placeholder="${currentI18n.descriptionPlaceholder}"></textarea>
          </div>
          
          <div class="form-group">
            <label for="item-url">${currentI18n.url}</label>
            <input type="url" id="item-url" name="url" placeholder="${currentI18n.urlPlaceholder}" required />
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" name="openNewWindow" />
              <span>${currentI18n.openNewWindow}</span>
            </label>
          </div>
        </form>
      </div>
      <div class="popup-footer">
        <button type="button" class="btn-secondary popup-cancel">${currentI18n.cancel}</button>
        <button type="submit" form="item-form" class="btn-primary">${currentI18n.save}</button>
      </div>
    </div>
  `;

  document.body.appendChild(itemPopupOverlay);

  // Event listeners
  itemPopupOverlay.querySelector('.popup-close')?.addEventListener('click', closeItemPopup);
  itemPopupOverlay.querySelector('.popup-cancel')?.addEventListener('click', closeItemPopup);
  itemPopupOverlay.addEventListener('click', (e) => {
    if (e.target === itemPopupOverlay) {
      closeItemPopup();
    }
  });

  // Icon picker trigger
  itemPopupOverlay.querySelector('#icon-input')?.addEventListener('click', openIconPickerForItem);

  const form = itemPopupOverlay.querySelector<HTMLFormElement>('#item-form');
  form?.addEventListener('submit', handleItemSubmit);
}

function updateCardSelect(): void {
  const select = itemPopupOverlay?.querySelector<HTMLSelectElement>('#item-card');
  if (!select || !currentI18n) {
    return;
  }

  const cards = getUserCards();
  const currentValue = select.value;

  select.innerHTML = `<option value="">${currentI18n.selectCardPlaceholder}</option>`;
  cards.forEach((card) => {
    const option = document.createElement('option');
    option.value = card.id;
    option.textContent = card.title;
    select.appendChild(option);
  });

  // Restore selection if possible
  if (currentValue && cards.some((c) => c.id === currentValue)) {
    select.value = currentValue;
  }
}

function updateIconDisplay(icon: string): void {
  selectedIcon = icon;
  const iconInput = itemPopupOverlay?.querySelector('#icon-input');
  const selectedIconEl = iconInput?.querySelector('.selected-icon');
  const placeholderEl = iconInput?.querySelector('.placeholder');
  const hiddenInput = itemPopupOverlay?.querySelector<HTMLInputElement>(
    'input[name="selectedIcon"]'
  );

  if (selectedIconEl && placeholderEl && hiddenInput) {
    if (icon) {
      selectedIconEl.innerHTML = `<i data-lucide="${icon}"></i>`;
      placeholderEl.textContent = icon;
      hiddenInput.value = icon;

      // Re-initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    } else {
      selectedIconEl.innerHTML = '';
      placeholderEl.textContent = currentI18n?.iconPlaceholder || '';
      hiddenInput.value = '';
    }
  }
}

function openIconPickerForItem(): void {
  if (!currentI18n) {
    return;
  }

  openIconPicker({
    selectedIcon,
    onSelect: (icon) => {
      updateIconDisplay(icon);
    },
    onClose: () => {},
    i18n: {
      title: currentI18n.iconPickerTitle,
      search: currentI18n.iconPickerSearch,
      noResult: currentI18n.iconPickerNoResult,
    },
  });
}

export function openAddItemPopup(preselectedCardId?: string): void {
  if (!itemPopupOverlay || !currentI18n) {
    return;
  }

  // Reset form
  const form = itemPopupOverlay.querySelector<HTMLFormElement>('#item-form');
  form?.reset();

  // Update title
  const title = itemPopupOverlay.querySelector('.popup-title');
  if (title) {
    title.textContent = currentI18n.addItem;
  }

  // Clear item ID
  const itemIdInput = itemPopupOverlay.querySelector<HTMLInputElement>('input[name="itemId"]');
  const originalCardIdInput = itemPopupOverlay.querySelector<HTMLInputElement>(
    'input[name="originalCardId"]'
  );
  if (itemIdInput) {
    itemIdInput.value = '';
  }
  if (originalCardIdInput) {
    originalCardIdInput.value = '';
  }

  // Reset icon
  updateIconDisplay('');

  // Update card select
  updateCardSelect();

  // Pre-select card if provided
  if (preselectedCardId) {
    const select = itemPopupOverlay.querySelector<HTMLSelectElement>('#item-card');
    if (select) {
      select.value = preselectedCardId;
    }
  }

  // Show popup
  itemPopupOverlay.classList.add('active');
  itemPopupOverlay.querySelector<HTMLSelectElement>('#item-card')?.focus();
}

export function openEditItemPopup(cardId: string, item: UserToolItem): void {
  if (!itemPopupOverlay || !currentI18n) {
    return;
  }

  // Update title
  const title = itemPopupOverlay.querySelector('.popup-title');
  if (title) {
    title.textContent = currentI18n.editItem;
  }

  // Set item ID and original card ID
  const itemIdInput = itemPopupOverlay.querySelector<HTMLInputElement>('input[name="itemId"]');
  const originalCardIdInput = itemPopupOverlay.querySelector<HTMLInputElement>(
    'input[name="originalCardId"]'
  );
  if (itemIdInput) {
    itemIdInput.value = item.id;
  }
  if (originalCardIdInput) {
    originalCardIdInput.value = cardId;
  }

  // Update card select and set value
  updateCardSelect();
  const cardSelect = itemPopupOverlay.querySelector<HTMLSelectElement>('#item-card');
  if (cardSelect) {
    cardSelect.value = cardId;
  }

  // Set icon
  updateIconDisplay(item.icon);

  // Set other fields
  const titleInput = itemPopupOverlay.querySelector<HTMLInputElement>('#item-title');
  const descInput = itemPopupOverlay.querySelector<HTMLTextAreaElement>('#item-description');
  const urlInput = itemPopupOverlay.querySelector<HTMLInputElement>('#item-url');
  const newWindowCheckbox = itemPopupOverlay.querySelector<HTMLInputElement>(
    'input[name="openNewWindow"]'
  );

  if (titleInput) {
    titleInput.value = item.title;
  }
  if (descInput) {
    descInput.value = item.description;
  }
  if (urlInput) {
    urlInput.value = item.url;
  }
  if (newWindowCheckbox) {
    newWindowCheckbox.checked = item.openNewWindow;
  }

  // Show popup
  itemPopupOverlay.classList.add('active');
}

function closeItemPopup(): void {
  itemPopupOverlay?.classList.remove('active');
  selectedIcon = '';
}

function handleItemSubmit(e: Event): void {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  const itemId = formData.get('itemId') as string;
  const originalCardId = formData.get('originalCardId') as string;
  const cardId = formData.get('cardId') as string;
  const icon = (formData.get('selectedIcon') as string) || 'link';
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;

  // Get checkbox value directly from the element
  const openNewWindowCheckbox = form.querySelector<HTMLInputElement>('input[name="openNewWindow"]');
  const openNewWindow = openNewWindowCheckbox?.checked ?? false;

  if (!cardId || !title.trim() || !url.trim()) {
    return;
  }

  if (itemId) {
    // Update existing item
    // Check if card changed
    if (originalCardId && originalCardId !== cardId) {
      // Move item to new card - delete from old, add to new
      deleteItem(originalCardId, itemId);
      const newItem = addItem(cardId, {
        icon,
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        openNewWindow,
      });
      if (newItem) {
        currentCallbacks.onItemDeleted?.(originalCardId, itemId);
        currentCallbacks.onItemAdded?.(cardId, newItem);
      }
    } else {
      // Update in same card
      const updatedItem = updateItem(cardId, itemId, {
        icon,
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        openNewWindow,
      });
      if (updatedItem) {
        currentCallbacks.onItemUpdated?.(cardId, updatedItem);
      }
    }
  } else {
    // Add new item
    const newItem = addItem(cardId, {
      icon,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      openNewWindow,
    });
    if (newItem) {
      currentCallbacks.onItemAdded?.(cardId, newItem);
    }
  }

  closeItemPopup();
}

// ============================================
// Delete Handlers
// ============================================

export function confirmDeleteCard(cardId: string): void {
  if (!currentI18n) {
    return;
  }

  if (confirm(currentI18n.deleteConfirm)) {
    if (deleteCard(cardId)) {
      currentCallbacks.onCardDeleted?.(cardId);
    }
  }
}

export function confirmDeleteItem(cardId: string, itemId: string): void {
  if (!currentI18n) {
    return;
  }

  if (confirm(currentI18n.deleteConfirm)) {
    if (deleteItem(cardId, itemId)) {
      currentCallbacks.onItemDeleted?.(cardId, itemId);
    }
  }
}
