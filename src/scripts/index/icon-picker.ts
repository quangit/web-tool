// ============================================
// Icon Picker Component
// ============================================

// Popular Lucide icons for the picker
export const POPULAR_ICONS = [
  // General
  'home',
  'settings',
  'search',
  'star',
  'heart',
  'bookmark',
  'flag',
  'bell',
  'calendar',
  'clock',
  'timer',
  'alarm-clock',
  'watch',

  // Files & Folders
  'file',
  'file-text',
  'file-code',
  'file-image',
  'file-video',
  'file-audio',
  'folder',
  'folder-open',
  'archive',
  'clipboard',
  'download',
  'upload',

  // Communication
  'mail',
  'message-circle',
  'message-square',
  'phone',
  'video',
  'mic',
  'send',
  'share',
  'share-2',
  'link',
  'link-2',
  'external-link',

  // Media
  'image',
  'camera',
  'film',
  'music',
  'play',
  'pause',
  'stop',
  'volume-2',
  'headphones',
  'radio',
  'tv',
  'monitor',
  'smartphone',
  'tablet',

  // Development
  'code',
  'code-2',
  'terminal',
  'git-branch',
  'git-commit',
  'git-merge',
  'database',
  'server',
  'cloud',
  'globe',
  'wifi',
  'bluetooth',
  'cpu',
  'hard-drive',
  'usb',
  'plug',

  // Security
  'lock',
  'unlock',
  'key',
  'shield',
  'shield-check',
  'shield-alert',
  'fingerprint',
  'eye',
  'eye-off',
  'scan',
  'qr-code',

  // Hash & Crypto
  'hash',
  'binary',
  'braces',
  'brackets',
  'at-sign',

  // Actions
  'plus',
  'minus',
  'x',
  'check',
  'check-circle',
  'x-circle',
  'refresh-cw',
  'rotate-cw',
  'rotate-ccw',
  'undo',
  'redo',
  'edit',
  'edit-2',
  'edit-3',
  'trash',
  'trash-2',
  'copy',
  'scissors',
  'save',
  'printer',
  'zap',
  'activity',

  // Arrows & Navigation
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'corner-down-left',
  'corner-down-right',
  'move',
  'maximize',
  'minimize',

  // Shapes
  'circle',
  'square',
  'triangle',
  'hexagon',
  'octagon',
  'star',
  'box',
  'package',
  'layers',
  'layout',
  'grid',
  'list',

  // People & Social
  'user',
  'users',
  'user-plus',
  'user-minus',
  'user-check',
  'smile',
  'meh',
  'frown',
  'thumbs-up',
  'thumbs-down',

  // Tools
  'wrench',
  'hammer',
  'tool',
  'scissors',
  'pen-tool',
  'brush',
  'crop',
  'scale',
  'ruler',
  'compass',
  'crosshair',

  // Text & Format
  'type',
  'bold',
  'italic',
  'underline',
  'align-left',
  'align-center',
  'align-right',
  'align-justify',
  'list',
  'list-ordered',

  // Business
  'briefcase',
  'building',
  'credit-card',
  'dollar-sign',
  'shopping-cart',
  'tag',
  'tags',
  'percent',
  'gift',
  'award',
  'trophy',

  // Nature & Weather
  'sun',
  'moon',
  'cloud',
  'cloud-rain',
  'cloud-snow',
  'wind',
  'thermometer',
  'droplet',
  'leaf',
  'flower',
  'tree',

  // Misc
  'info',
  'help-circle',
  'alert-circle',
  'alert-triangle',
  'coffee',
  'book',
  'book-open',
  'notebook',
  'graduation-cap',
  'rocket',
  'plane',
  'car',
  'truck',
  'map',
  'map-pin',
  'navigation',
  'anchor',
  'compass',
  'target',
  'crosshair',
  'aperture',
];

export interface IconPickerOptions {
  onSelect: (icon: string) => void;
  onClose: () => void;
  selectedIcon?: string;
  i18n: {
    title: string;
    search: string;
    noResult: string;
  };
}

let pickerOverlay: HTMLElement | null = null;
let currentOptions: IconPickerOptions | null = null;

export function openIconPicker(options: IconPickerOptions): void {
  currentOptions = options;

  // Create or reuse overlay
  if (!pickerOverlay) {
    pickerOverlay = createIconPickerDOM(options);
    document.body.appendChild(pickerOverlay);
  } else {
    updateIconPickerContent(options);
  }

  // Show overlay
  requestAnimationFrame(() => {
    pickerOverlay?.classList.add('active');
  });

  // Focus search input
  const searchInput = pickerOverlay.querySelector<HTMLInputElement>('.icon-picker-search input');
  searchInput?.focus();
}

export function closeIconPicker(): void {
  if (pickerOverlay) {
    pickerOverlay.classList.remove('active');
  }
  currentOptions?.onClose();
  currentOptions = null;
}

function createIconPickerDOM(options: IconPickerOptions): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'icon-picker-overlay';
  overlay.innerHTML = `
    <div class="icon-picker-modal">
      <div class="icon-picker-header">
        <h3>${options.i18n.title}</h3>
        <button class="popup-close" type="button" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="icon-picker-search">
        <input type="text" placeholder="${options.i18n.search}" />
      </div>
      <div class="icon-picker-grid"></div>
    </div>
  `;

  // Close button
  overlay.querySelector('.popup-close')?.addEventListener('click', closeIconPicker);

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeIconPicker();
    }
  });

  // Search functionality
  const searchInput = overlay.querySelector<HTMLInputElement>('.icon-picker-search input');
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    filterIcons(query, options);
  });

  // Escape key to close
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeIconPicker();
    }
  });

  // Render initial icons directly on the overlay element (not using pickerOverlay which isn't assigned yet)
  renderIconsToGrid(overlay.querySelector('.icon-picker-grid')!, options);

  return overlay;
}

function updateIconPickerContent(options: IconPickerOptions): void {
  if (!pickerOverlay) {
    return;
  }

  // Update title
  const title = pickerOverlay.querySelector('.icon-picker-header h3');
  if (title) {
    title.textContent = options.i18n.title;
  }

  // Update search placeholder
  const searchInput = pickerOverlay.querySelector<HTMLInputElement>('.icon-picker-search input');
  if (searchInput) {
    searchInput.placeholder = options.i18n.search;
    searchInput.value = '';
  }

  // Re-render icons
  renderIcons(POPULAR_ICONS, options);
}

function filterIcons(query: string, options: IconPickerOptions): void {
  const filtered = query ? POPULAR_ICONS.filter((icon) => icon.includes(query)) : POPULAR_ICONS;
  renderIcons(filtered, options);
}

function renderIcons(icons: string[], options: IconPickerOptions): void {
  const grid = pickerOverlay?.querySelector('.icon-picker-grid');
  if (!grid) {
    return;
  }
  renderIconsToGrid(grid as HTMLElement, options, icons);
}

function renderIconsToGrid(
  grid: HTMLElement,
  options: IconPickerOptions,
  icons: string[] = POPULAR_ICONS
): void {
  if (icons.length === 0) {
    grid.innerHTML = `<div class="icon-picker-empty">${options.i18n.noResult}</div>`;
    return;
  }

  grid.innerHTML = icons
    .map((icon) => {
      const isSelected = icon === options.selectedIcon ? 'selected' : '';
      return `
        <button class="icon-picker-item ${isSelected}" data-icon="${icon}" type="button" title="${icon}">
          <i data-lucide="${icon}"></i>
          <span class="icon-name">${icon}</span>
        </button>
      `;
    })
    .join('');

  // Re-initialize Lucide icons - wait for library to load if needed
  initializeLucideIcons();

  // Add click handlers
  grid.querySelectorAll('.icon-picker-item').forEach((item) => {
    item.addEventListener('click', () => {
      const icon = (item as HTMLElement).dataset.icon;
      if (icon && currentOptions) {
        currentOptions.onSelect(icon);
        closeIconPicker();
      }
    });
  });
}

// Helper function to initialize Lucide icons, waiting for library if not loaded yet
function initializeLucideIcons(): void {
  if (window.lucide) {
    requestAnimationFrame(() => {
      window.lucide?.createIcons();
    });
  } else {
    // Lucide not loaded yet, wait and retry
    const checkLucide = setInterval(() => {
      if (window.lucide) {
        clearInterval(checkLucide);
        requestAnimationFrame(() => {
          window.lucide?.createIcons();
        });
      }
    }, 50);

    // Stop checking after 5 seconds to avoid infinite loop
    setTimeout(() => {
      clearInterval(checkLucide);
    }, 5000);
  }
}
