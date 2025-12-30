// S-Notes Context Menu - Right-click menu management
import { getTranslations } from '../constants.js';

let contextMenu = null;
let contextMenuNoteId = null;
let notesListElement = null;

/**
 * Initialize context menu with required dependencies
 */
export function initContextMenu(notesList) {
  notesListElement = notesList;
}

/**
 * Create context menu element
 */
export function createContextMenu(handlers) {
  if (contextMenu) {
    return contextMenu;
  }

  const t = getTranslations();

  contextMenu = document.createElement('div');
  contextMenu.className = 'note-context-menu';
  contextMenu.innerHTML = `
    <div class="note-context-menu-item create-child" data-action="create-child">
      <span>➕</span>
      <span>${t.createChild || 'Create Note Item'}</span>
    </div>
    <div class="note-context-menu-item favorite" data-action="toggle-favorite">
      <span>⭐</span>
      <span class="favorite-text">${t.addToFavorites || 'Add to Favorites'}</span>
    </div>
    <div class="note-context-menu-item delete" data-action="delete">
      <span>🗑️</span>
      <span>${t.delete || 'Delete'}</span>
    </div>
  `;

  document.body.appendChild(contextMenu);

  // Handle menu item clicks
  contextMenu.addEventListener('click', async (e) => {
    const item = e.target.closest('.note-context-menu-item');
    if (!item) {
      return;
    }

    const action = item.dataset.action;
    const targetNoteId = contextMenuNoteId;
    hideContextMenu();

    if (action === 'create-child' && targetNoteId) {
      await handlers.onCreateChild(targetNoteId);
      return;
    }

    if (action === 'toggle-favorite' && targetNoteId) {
      await handlers.onToggleFavorite(targetNoteId);
      return;
    }

    if (action === 'delete' && targetNoteId) {
      await handlers.onDelete(targetNoteId);
    }
  });

  // Hide menu on click outside
  document.addEventListener('click', (e) => {
    if (contextMenu && !contextMenu.contains(e.target)) {
      hideContextMenu();
    }
  });

  // Hide menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideContextMenu();
    }
  });

  // Hide menu on scroll
  if (notesListElement) {
    notesListElement.addEventListener('scroll', () => {
      hideContextMenu();
    });
  }

  return contextMenu;
}

/**
 * Show context menu at position
 */
export function showContextMenu(event, noteId, notes, handlers) {
  const menu = createContextMenu(handlers, notes);
  contextMenuNoteId = noteId;

  const t = getTranslations();

  // Update favorite menu item text based on note's current state
  const note = notes.find((n) => n.id === noteId);
  const favoriteItem = menu.querySelector('[data-action="toggle-favorite"] .favorite-text');
  if (favoriteItem && note) {
    favoriteItem.textContent = note.isFavorite
      ? t.removeFromFavorites || 'Remove from Favorites'
      : t.addToFavorites || 'Add to Favorites';
  }

  // Position menu at mouse cursor
  const x = event.clientX;
  const y = event.clientY;

  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.add('show');

  // Adjust position if menu goes off screen
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (rect.right > viewportWidth) {
      menu.style.left = x - rect.width + 'px';
    }

    if (rect.bottom > viewportHeight) {
      menu.style.top = y - rect.height + 'px';
    }
  });
}

/**
 * Hide context menu
 */
export function hideContextMenu() {
  if (contextMenu) {
    contextMenu.classList.remove('show');
    contextMenuNoteId = null;
  }
}

/**
 * Get current context menu note ID
 */
export function getContextMenuNoteId() {
  return contextMenuNoteId;
}
