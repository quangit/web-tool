// S-Notes Toolbar - Button creation and management
import { ICONS, TOOLBAR_BUTTON_STYLE, getTranslations } from '../constants.js';

// Reference to favorite button for external updates
let favoriteButton = null;

/**
 * Helper to create toolbar button with hover effect
 */
export function createToolbarButton(className, icon, title, hoverColor, onClick) {
  const button = document.createElement('button');
  button.className = `toastui-editor-toolbar-icons ${className}`;
  button.type = 'button';
  button.innerHTML = icon;
  button.title = title;
  button.style.cssText = TOOLBAR_BUTTON_STYLE;

  button.addEventListener('mouseenter', () => {
    button.style.background = hoverColor;
  });
  button.addEventListener('mouseleave', () => {
    button.style.background = 'none';
  });
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    await onClick();
  });

  return button;
}

/**
 * Create custom delete button for Toast UI Editor
 */
export function createDeleteButton(onDelete) {
  return createToolbarButton(
    'delete-note-btn',
    ICONS.delete,
    'Delete current note (Ctrl+Shift+D)',
    'rgba(220, 53, 69, 0.1)',
    onDelete
  );
}

/**
 * Create open in new window button
 */
export function createOpenWindowButton(onOpenWindow) {
  const t = getTranslations();
  return createToolbarButton(
    'open-window-btn',
    ICONS.openWindow,
    t.openInNewWindow || 'Open in new window',
    'rgba(59, 130, 246, 0.1)',
    onOpenWindow
  );
}

/**
 * Create favorite star button
 */
export function createFavoriteButton(onToggleFavorite) {
  const t = getTranslations();
  const button = createToolbarButton(
    'favorite-note-btn',
    ICONS.starOutline,
    t.addToFavorites || 'Add to Favorites',
    'rgba(245, 158, 11, 0.1)',
    onToggleFavorite
  );
  favoriteButton = button;
  return button;
}

/**
 * Update favorite button appearance
 */
export function updateFavoriteButton(isFavorite) {
  if (!favoriteButton) {
    return;
  }

  const t = getTranslations();
  favoriteButton.innerHTML = isFavorite ? ICONS.starFilled : ICONS.starOutline;
  favoriteButton.title = isFavorite
    ? t.removeFromFavorites || 'Remove from Favorites'
    : t.addToFavorites || 'Add to Favorites';
}

/**
 * Get toolbar items configuration for Toast UI Editor
 */
export function getToolbarItems(handlers) {
  return [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr', 'quote'],
    ['ul', 'ol', 'task', 'indent', 'outdent'],
    ['table', 'image', 'link'],
    ['code', 'codeblock'],
    ['scrollSync'],
    [
      {
        el: createOpenWindowButton(handlers.onOpenWindow),
        name: 'openWindow',
        tooltip: 'Open in new window',
      },
      {
        el: createFavoriteButton(handlers.onToggleFavorite),
        name: 'favoriteNote',
        tooltip: 'Toggle favorite',
      },
      {
        el: createDeleteButton(handlers.onDelete),
        name: 'deleteNote',
        tooltip: 'Delete current note',
      },
    ],
  ];
}
