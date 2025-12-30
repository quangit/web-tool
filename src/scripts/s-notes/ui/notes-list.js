// S-Notes Notes List - Rendering and tree management
import { ICONS, getTranslations } from '../constants.js';
import { escapeHtml, formatDate } from '../utils.js';
import { buildNotesTree, searchNotes } from '../storage.js';
import { showContextMenu } from './context-menu.js';

// Track expanded state for nested notes
const expandedNotes = new Set();

/**
 * Render notes list
 */
export async function renderNotesList(
  notesList,
  notes,
  activeNoteId,
  activeTab,
  filter,
  handlers
) {
  const t = getTranslations();
  let displayNotes = filter ? await searchNotes(filter) : notes;

  // Filter by active tab
  if (activeTab === 'favorites') {
    displayNotes = displayNotes.filter((n) => n.isFavorite);
  }

  notesList.innerHTML = '';

  // Show empty state message for favorites tab
  if (displayNotes.length === 0 && activeTab === 'favorites') {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'notes-list-empty';
    emptyMsg.textContent = t.noFavorites || 'No favorite notes yet';
    notesList.appendChild(emptyMsg);
    return;
  }

  // If filtering, show flat list
  if (filter) {
    displayNotes.forEach((note) => {
      const noteItem = createNoteItemElement(note, 0, activeNoteId, notes, handlers);
      notesList.appendChild(noteItem);
    });
    return;
  }

  // Build tree structure for nested display
  const tree = buildNotesTree(displayNotes);

  // Render tree recursively
  function renderNoteNode(node, level) {
    const noteItem = createNoteItemElement(node, level, activeNoteId, notes, handlers);
    notesList.appendChild(noteItem);

    // Render children if expanded
    if (node.children && node.children.length > 0 && expandedNotes.has(node.id)) {
      node.children.forEach((child) => renderNoteNode(child, level + 1));
    }
  }

  tree.forEach((node) => renderNoteNode(node, 0));
}

/**
 * Create a note item DOM element
 */
function createNoteItemElement(note, level, activeNoteId, notes, handlers) {
  const noteItem = document.createElement('div');
  noteItem.className = 'note-item';
  noteItem.dataset.noteId = note.id;
  noteItem.dataset.level = level;

  if (note.id === activeNoteId) {
    noteItem.classList.add('active');
  }

  const attachmentBadge = note.attachmentCount
    ? `<span class="note-item-attachments">${note.attachmentCount}</span>`
    : '';

  const favoriteStar = note.isFavorite ? `<span class="note-item-favorite">⭐</span>` : '';

  const hasChildNotes = note.children && note.children.length > 0;
  const isExpanded = expandedNotes.has(note.id);

  const toggleIcon = hasChildNotes
    ? `<span class="note-toggle ${isExpanded ? 'expanded' : ''}" data-note-id="${note.id}">${ICONS.chevronRight}</span>`
    : `<span class="note-toggle-placeholder"></span>`;

  const indentStyle = level > 0 ? `padding-left: ${level * 1.25 + 1}rem;` : '';

  noteItem.innerHTML = `
    <div class="note-item-content" style="${indentStyle}">
      ${toggleIcon}
      <div class="note-item-text">
        <div class="note-item-title">${favoriteStar}${escapeHtml(note.title)}</div>
        <div class="note-item-meta">
          <span class="note-item-date">${formatDate(note.updatedAt)}</span>
          ${attachmentBadge}
          ${hasChildNotes ? `<span class="note-item-children">${note.children.length}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  // Handle toggle click
  const toggle = noteItem.querySelector('.note-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNoteExpand(note.id, handlers.onRenderList);
    });
  }

  noteItem.addEventListener('click', (e) => {
    // Don't select if clicking on toggle
    if (!e.target.closest('.note-toggle')) {
      handlers.onSelectNote(note.id);
    }
  });

  // Right click to show context menu
  noteItem.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e, note.id, notes, handlers.contextMenuHandlers);
  });

  return noteItem;
}

/**
 * Toggle expand/collapse for a note
 */
function toggleNoteExpand(noteId, onRenderList) {
  if (expandedNotes.has(noteId)) {
    expandedNotes.delete(noteId);
  } else {
    expandedNotes.add(noteId);
  }
  onRenderList();
}

/**
 * Add note to expanded set
 */
export function expandNote(noteId) {
  expandedNotes.add(noteId);
}

/**
 * Check if note is expanded
 */
export function isNoteExpanded(noteId) {
  return expandedNotes.has(noteId);
}
