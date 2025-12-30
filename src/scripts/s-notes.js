/* eslint-disable no-console */
// S-Notes - Advanced Note Taking App with Toast UI Editor
// Storage: IndexedDB for metadata + OPFS for attachments

import { getTranslations } from './s-notes/constants.js';
import {
  initEditor,
  getEditor,
  getMarkdown,
  setMarkdown,
  focusEditor,
  generateViewerHtml,
} from './s-notes/editor.js';
import { updateFavoriteButton } from './s-notes/ui/toolbar.js';
import { initContextMenu } from './s-notes/ui/context-menu.js';
import { renderNotesList, expandNote } from './s-notes/ui/notes-list.js';
import {
  cancelGarbageCollection,
  cleanupOrphanedAttachments,
  clearImageCaches,
  deleteNoteWithDescendants,
  findOrphanedAttachments,
  generateId,
  getAllNotes,
  getAttachmentBlob,
  getAttachmentsForNote,
  getNote,
  hasChildren,
  initDatabase,
  initOPFS,
  restoreImageUrls,
  saveAttachment,
  saveNote,
  scheduleGarbageCollection,
  setAttachmentUpdater,
} from './s-notes/storage.js';

(function () {
  'use strict';

  // ============================================
  // STATE
  // ============================================
  let notes = [];
  let activeNoteId = null;
  let activeTab = 'all';

  // DOM Elements
  const notesList = document.getElementById('notes-list');
  const newNoteBtn = document.getElementById('new-note-btn');
  const searchInput = document.getElementById('search-notes');
  const noteEditor = document.getElementById('note-editor');
  const emptyState = document.getElementById('empty-state');
  const editorContainer = document.getElementById('editor-container');
  const storageStatus = document.getElementById('storage-status');

  // Translations
  const t = getTranslations();

  // ============================================
  // HELPERS
  // ============================================
  function getTitleFromContent(content) {
    if (!content) {
      return t.untitled;
    }
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        return trimmed.replace(/^#+\s*/, '').substring(0, 50) || t.untitled;
      }
    }
    return t.untitled;
  }

  function updateStatus(status, text) {
    if (storageStatus) {
      storageStatus.className = 'storage-status ' + status;
      const statusText = storageStatus.querySelector('.status-text');
      if (statusText) {
        statusText.textContent = text || t[status] || status;
      }
    }
  }

  function showEmptyState() {
    noteEditor.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }

  function hideEmptyState() {
    noteEditor.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  // ============================================
  // NOTE OPERATIONS
  // ============================================
  async function saveCurrentNote() {
    if (!activeNoteId || !getEditor()) {
      return;
    }

    const note = await getNote(activeNoteId);
    if (!note) {
      return;
    }

    const content = getMarkdown();

    // Only update if content actually changed
    if (note.content === content) {
      return;
    }

    note.content = content;
    note.title = getTitleFromContent(content);
    note.updatedAt = Date.now();

    await saveNote(note);

    // Update local notes array to reflect changes in UI immediately
    const noteIndex = notes.findIndex((n) => n.id === activeNoteId);
    if (noteIndex !== -1) {
      notes[noteIndex] = note;
    }

    await updateNoteAttachments();

    // Update list without losing scroll position
    doRenderNotesList();

    // Auto cleanup after content changes (with delay to avoid frequent runs)
    scheduleGarbageCollection(60000); // 1 minute delay
  }

  async function updateNoteAttachments(noteId = null) {
    const targetNoteId = noteId || activeNoteId;
    if (!targetNoteId) {
      return;
    }

    const note = await getNote(targetNoteId);
    if (!note) {
      return;
    }

    const attachments = await getAttachmentsForNote(targetNoteId);
    note.attachmentCount = attachments.length;
    await saveNote(note);

    // Update local notes array
    const noteIndex = notes.findIndex((n) => n.id === targetNoteId);
    if (noteIndex !== -1) {
      notes[noteIndex] = note;
    }
  }

  setAttachmentUpdater(updateNoteAttachments);

  async function selectNote(id) {
    // Save current note before switching
    if (activeNoteId && getEditor()) {
      await saveCurrentNote();
    }

    const note = await getNote(id);
    if (!note) {
      return;
    }

    activeNoteId = id;
    localStorage.setItem('snotes-active', id);

    if (getEditor()) {
      // Restore image URLs before setting content
      const contentWithRestoredImages = await restoreImageUrls(id, note.content || '');
      setMarkdown(contentWithRestoredImages);
    }

    // Update favorite button state
    updateFavoriteButton(note.isFavorite);

    hideEmptyState();
    doRenderNotesList();
  }

  async function createNewNote() {
    const newNote = {
      id: generateId(),
      title: t.untitled,
      content: '',
      tags: [],
      attachmentCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveNote(newNote);
    notes.unshift(newNote);
    doRenderNotesList();
    selectNote(newNote.id);
    focusEditor();
  }

  async function createChildNote(parentId) {
    // Ensure parent is expanded
    expandNote(parentId);

    const newNote = {
      id: generateId(),
      title: t.untitled,
      content: '',
      parentId: parentId,
      tags: [],
      attachmentCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveNote(newNote);
    notes.unshift(newNote);
    doRenderNotesList();
    await selectNote(newNote.id);
    focusEditor();
  }

  // ============================================
  // DELETE & FAVORITE
  // ============================================
  async function performDeleteNote(noteId) {
    const note = await getNote(noteId);
    if (!note) {
      return false;
    }

    const hasChildNotes = hasChildren(noteId, notes);
    const confirmMsg = hasChildNotes
      ? `${t.confirmDeleteWithChildren || 'This note has child notes. Delete this note and all its children?'}\n\n"${note.title}"`
      : `${t.confirmDelete || 'Are you sure you want to delete this note?'}\n\n"${note.title}"`;

    if (!confirm(confirmMsg)) {
      return false;
    }

    // Find next note to select (prefer sibling, then parent)
    let nextNote = null;
    const siblingNotes = notes.filter((n) => !n.parentId || n.parentId === note.parentId);
    const currentIndex = siblingNotes.findIndex((n) => n.id === noteId);

    if (siblingNotes.length > 1) {
      nextNote = siblingNotes[currentIndex + 1] || siblingNotes[currentIndex - 1];
    } else if (note.parentId) {
      nextNote = notes.find((n) => n.id === note.parentId);
    }

    try {
      updateStatus('syncing', t.syncing || 'Deleting...');

      const deletedIds = await deleteNoteWithDescendants(noteId);
      notes = notes.filter((n) => !deletedIds.includes(n.id));

      activeNoteId = null;
      localStorage.removeItem('snotes-active');

      if (nextNote && notes.some((n) => n.id === nextNote.id)) {
        await selectNote(nextNote.id);
      } else if (notes.length > 0) {
        await selectNote(notes[0].id);
      } else {
        setMarkdown('');
        showEmptyState();
      }

      doRenderNotesList();
      updateStatus('ready', t.ready);
      return true;
    } catch (e) {
      console.error('Failed to delete note:', e);
      updateStatus('error', t.error);
      alert('Failed to delete note. Please try again.');
      return false;
    }
  }

  async function handleDeleteCurrentNote() {
    if (!activeNoteId) {
      alert(t.noNotes || 'No note selected');
      return;
    }
    await performDeleteNote(activeNoteId);
  }

  async function toggleFavorite(noteId = null) {
    const targetId = noteId || activeNoteId;
    if (!targetId) {
      return;
    }

    const note = await getNote(targetId);
    if (!note) {
      return;
    }

    note.isFavorite = !note.isFavorite;
    await saveNote(note);

    // Update local notes array
    const noteIndex = notes.findIndex((n) => n.id === targetId);
    if (noteIndex !== -1) {
      notes[noteIndex] = note;
    }

    updateFavoriteButton(note.isFavorite);
    doRenderNotesList();
  }

  // ============================================
  // OPEN IN NEW WINDOW
  // ============================================
  async function handleOpenInNewWindow() {
    if (!activeNoteId) {
      alert(t.noNotes || 'No note selected');
      return;
    }

    const note = await getNote(activeNoteId);
    if (!note) {
      return;
    }

    try {
      const newWindow = window.open(
        '',
        '_blank',
        'width=1000,height=700,scrollbars=yes,resizable=yes'
      );

      if (!newWindow) {
        alert('Pop-up blocked. Please allow pop-ups for this site.');
        return;
      }

      const currentContent = getEditor() ? getMarkdown() : note.content;
      const htmlContent = generateViewerHtml(note, currentContent, t);

      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
    } catch (e) {
      console.error('Failed to open in new window:', e);
      alert('Failed to open note in new window');
    }
  }

  // ============================================
  // ATTACHMENT HANDLING
  // ============================================
  async function handleSaveAttachment(blob) {
    const attachment = await saveAttachment(activeNoteId, blob);
    const attachmentBlob = await getAttachmentBlob(attachment);
    const url = URL.createObjectURL(attachmentBlob);
    await updateNoteAttachments();
    return { url, fileName: attachment.fileName };
  }

  // ============================================
  // GARBAGE COLLECTION
  // ============================================
  async function runManualGarbageCollection() {
    updateStatus('syncing', t.syncing || 'Cleaning up...');

    try {
      const result = await cleanupOrphanedAttachments();

      if (result.deleted > 0) {
        doRenderNotesList();
      }

      updateStatus('ready', t.ready);
      console.log(`Cleanup completed: ${result.deleted} files deleted`);

      return result;
    } catch (e) {
      console.error('Manual garbage collection failed:', e);
      updateStatus('error', t.error);
      throw e;
    }
  }

  // ============================================
  // RENDER WRAPPER
  // ============================================
  function doRenderNotesList() {
    const contextMenuHandlers = {
      onCreateChild: createChildNote,
      onToggleFavorite: toggleFavorite,
      onDelete: performDeleteNote,
    };

    const handlers = {
      onSelectNote: selectNote,
      onRenderList: doRenderNotesList,
      contextMenuHandlers,
    };

    renderNotesList(notesList, notes, activeNoteId, activeTab, searchInput?.value || '', handlers);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function attachEventListeners() {
    newNoteBtn.addEventListener('click', createNewNote);

    searchInput.addEventListener('input', () => {
      doRenderNotesList();
    });

    // Tab switching
    const tabAll = document.getElementById('tab-all');
    const tabFavorites = document.getElementById('tab-favorites');

    if (tabAll) {
      tabAll.addEventListener('click', () => {
        activeTab = 'all';
        tabAll.classList.add('active');
        tabFavorites?.classList.remove('active');
        doRenderNotesList();
      });
    }

    if (tabFavorites) {
      tabFavorites.addEventListener('click', () => {
        activeTab = 'favorites';
        tabFavorites.classList.add('active');
        tabAll?.classList.remove('active');
        doRenderNotesList();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + N: New note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }

      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        if (!editorContainer.contains(document.activeElement)) {
          e.preventDefault();
          searchInput.focus();
        }
      }

      // Ctrl/Cmd + S: Force save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentNote();
      }

      // Ctrl/Cmd + Shift + D: Delete current note
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        handleDeleteCurrentNote();
      }

      // Ctrl/Cmd + Shift + Delete: Manual garbage collection
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        console.log('Manual garbage collection triggered by user');
        runManualGarbageCollection();
      }
    });
  }

  // ============================================
  // MIGRATION
  // ============================================
  async function migrateFromLocalStorage() {
    const oldData = localStorage.getItem('simple-notes-data');
    if (!oldData) {
      return;
    }

    try {
      const oldNotes = JSON.parse(oldData);
      if (Array.isArray(oldNotes) && oldNotes.length > 0) {
        for (const oldNote of oldNotes) {
          const newNote = {
            id: oldNote.id || generateId(),
            title: getTitleFromContent(oldNote.content),
            content: oldNote.content || '',
            tags: [],
            attachmentCount: 0,
            createdAt: oldNote.timestamp || Date.now(),
            updatedAt: oldNote.timestamp || Date.now(),
          };
          await saveNote(newNote);
        }

        localStorage.removeItem('simple-notes-data');
        localStorage.removeItem('simple-notes-active');
        console.log('Migration from localStorage completed');
      }
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  async function init() {
    updateStatus('loading', t.loading);

    try {
      // Initialize storage
      await initDatabase();
      await initOPFS();

      // Initialize context menu
      initContextMenu(notesList);

      // Migrate old data
      await migrateFromLocalStorage();

      // Load notes
      notes = await getAllNotes();

      // Create welcome note if empty
      if (notes.length === 0) {
        const welcomeNote = {
          id: generateId(),
          title: 'Welcome to S-Notes!',
          content: `# Welcome to S-Notes! 🎉

This is a **powerful note-taking app** with full Markdown support.

## Features
- ✅ Rich text editing with Markdown
- ✅ Image attachments stored locally
- ✅ Fast search across all notes
- ✅ All data stays private in your browser
- ✅ Auto-save as you type

## Markdown Examples

### Text Formatting
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- \`Inline code\`

### Code Block
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

### Task List
- [x] Create a note
- [ ] Add an image
- [ ] Share with friends

### Table
| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Images | ✅ |
| Search | ✅ |

---
*Right-click on a note to delete it*`,
          tags: ['welcome'],
          attachmentCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await saveNote(welcomeNote);
        notes = [welcomeNote];
      }

      // Initialize editor with handlers
      initEditor(editorContainer, {
        onOpenWindow: handleOpenInNewWindow,
        onToggleFavorite: toggleFavorite,
        onDelete: handleDeleteCurrentNote,
        onSave: saveCurrentNote,
        onSaveAttachment: handleSaveAttachment,
        getActiveNoteId: () => activeNoteId,
        updateStatus,
      });

      // Render UI
      doRenderNotesList();
      attachEventListeners();

      // Load active note or first note
      const savedActiveId = localStorage.getItem('snotes-active');
      if (savedActiveId && notes.find((n) => n.id === savedActiveId)) {
        selectNote(savedActiveId);
      } else if (notes.length > 0) {
        selectNote(notes[0].id);
      } else {
        showEmptyState();
      }

      updateStatus('ready', t.ready);

      // Start garbage collection schedule after successful initialization
      console.log('Starting garbage collection scheduler...');
      scheduleGarbageCollection(30000);
    } catch (e) {
      console.error('Initialization failed:', e);
      updateStatus('error', t.error);
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup blob URLs when page unloads
  window.addEventListener('beforeunload', () => {
    cancelGarbageCollection();
    clearImageCaches();
    if (window.snotesImageUrls) {
      window.snotesImageUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* ignore revoke errors */
        }
      });
    }
  });

  // Expose garbage collection functions for debugging
  window.snotesGC = {
    findOrphaned: findOrphanedAttachments,
    cleanup: cleanupOrphanedAttachments,
    runManual: runManualGarbageCollection,
    schedule: scheduleGarbageCollection,
  };

  if (typeof window !== 'undefined' && typeof window.methodLoad === 'function') {
    window.methodLoad();
  }
})();
