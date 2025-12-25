// S-Notes - Advanced Note Taking App with Toast UI Editor
// Storage: IndexedDB for metadata + OPFS for attachments
(function () {
  'use strict';

  // ============================================
  // DATABASE & STORAGE LAYER
  // ============================================
  
  const DB_NAME = 'snotes-db';
  const DB_VERSION = 1;
  const NOTES_STORE = 'notes';
  const ATTACHMENTS_STORE = 'attachments';
  const OPFS_DIR = 'snotes-files';

  let db = null;
  let opfsRoot = null;
  let opfsDir = null;

  // Initialize IndexedDB
  async function initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // Notes store with indexes for fast querying
        if (!database.objectStoreNames.contains(NOTES_STORE)) {
          const notesStore = database.createObjectStore(NOTES_STORE, { keyPath: 'id' });
          notesStore.createIndex('title', 'title', { unique: false });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          notesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        // Attachments metadata store (file stored in OPFS)
        if (!database.objectStoreNames.contains(ATTACHMENTS_STORE)) {
          const attachStore = database.createObjectStore(ATTACHMENTS_STORE, { keyPath: 'id' });
          attachStore.createIndex('noteId', 'noteId', { unique: false });
          attachStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  // Initialize OPFS for file storage
  async function initOPFS() {
    try {
      opfsRoot = await navigator.storage.getDirectory();
      opfsDir = await opfsRoot.getDirectoryHandle(OPFS_DIR, { create: true });
      return true;
    } catch (e) {
      console.warn('OPFS not available, falling back to IndexedDB for attachments:', e);
      return false;
    }
  }

  // ============================================
  // NOTE OPERATIONS
  // ============================================

  async function getAllNotes() {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev'); // Sort by updatedAt DESC
      
      const notes = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          notes.push(cursor.value);
          cursor.continue();
        } else {
          resolve(notes);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async function getNote(id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveNote(note) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.put(note);
      
      request.onsuccess = () => resolve(note);
      request.onerror = () => reject(request.error);
    });
  }

  async function deleteNote(id) {
    // First delete all attachments for this note
    const attachments = await getAttachmentsForNote(id);
    for (const attachment of attachments) {
      await deleteAttachment(attachment.id);
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async function searchNotes(query) {
    const allNotes = await getAllNotes();
    const lowerQuery = query.toLowerCase();
    
    return allNotes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  // ============================================
  // ATTACHMENT OPERATIONS (OPFS + IndexedDB)
  // ============================================

  async function saveAttachment(noteId, file) {
    const id = generateId();
    const fileName = `${id}_${file.name}`;
    
    let filePath = null;
    let blobData = null;

    // Try to save to OPFS first
    if (opfsDir) {
      try {
        const fileHandle = await opfsDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        filePath = fileName;
      } catch (e) {
        console.warn('OPFS write failed, storing in IndexedDB:', e);
        blobData = await fileToArrayBuffer(file);
      }
    } else {
      blobData = await fileToArrayBuffer(file);
    }

    const attachmentMeta = {
      id,
      noteId,
      fileName: file.name,
      type: file.type,
      size: file.size,
      filePath, // OPFS path
      blobData, // Fallback: ArrayBuffer in IndexedDB
      createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ATTACHMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ATTACHMENTS_STORE);
      const request = store.put(attachmentMeta);
      
      request.onsuccess = () => resolve(attachmentMeta);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAttachment(id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ATTACHMENTS_STORE], 'readonly');
      const store = transaction.objectStore(ATTACHMENTS_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAttachmentBlob(attachment) {
    if (attachment.filePath && opfsDir) {
      try {
        const fileHandle = await opfsDir.getFileHandle(attachment.filePath);
        return await fileHandle.getFile();
      } catch (e) {
        console.warn('OPFS read failed:', e);
      }
    }
    
    if (attachment.blobData) {
      return new Blob([attachment.blobData], { type: attachment.type });
    }
    
    return null;
  }

  async function getAttachmentsForNote(noteId) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ATTACHMENTS_STORE], 'readonly');
      const store = transaction.objectStore(ATTACHMENTS_STORE);
      const index = store.index('noteId');
      const request = index.getAll(noteId);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async function deleteAttachment(id) {
    const attachment = await getAttachment(id);
    
    // Delete from OPFS if exists
    if (attachment && attachment.filePath && opfsDir) {
      try {
        await opfsDir.removeEntry(attachment.filePath);
      } catch (e) {
        console.warn('OPFS delete failed:', e);
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ATTACHMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ATTACHMENTS_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  function getTitleFromContent(content) {
    if (!content) return t.untitled;
    // Try to get first heading or first line
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        // Remove markdown heading syntax
        return trimmed.replace(/^#+\s*/, '').substring(0, 50) || t.untitled;
      }
    }
    return t.untitled;
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // UI & EDITOR
  // ============================================

  let notes = [];
  let activeNoteId = null;
  let editor = null;
  let saveTimeout = null;

  // DOM Elements
  const notesList = document.getElementById('notes-list');
  const newNoteBtn = document.getElementById('new-note-btn');
  const searchInput = document.getElementById('search-notes');
  const noteEditor = document.getElementById('note-editor');
  const emptyState = document.getElementById('empty-state');
  const editorContainer = document.getElementById('editor-container');
  const storageStatus = document.getElementById('storage-status');

  // Translations
  const t = window.notesTranslations || {
    untitled: 'Untitled Note',
    category: 'Notes',
    confirmDelete: 'Are you sure you want to delete this note?',
    noNotes: 'No notes yet. Click "New Note" to create one.',
    loading: 'Loading...',
    ready: 'Ready',
    syncing: 'Syncing...',
    error: 'Error',
    attachments: 'Attachments',
    deleteAttachment: 'Delete attachment?'
  };

  function updateStatus(status, text) {
    if (storageStatus) {
      storageStatus.className = 'storage-status ' + status;
      const statusText = storageStatus.querySelector('.status-text');
      if (statusText) statusText.textContent = text || t[status] || status;
    }
  }

  // Initialize Toast UI Editor
  function initEditor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    editor = new toastui.Editor({
      el: editorContainer,
      height: '450px',
      initialEditType: 'wysiwyg',
      previewStyle: 'vertical',
      theme: isDark ? 'dark' : 'light',
      placeholder: 'Start writing your note...',
      usageStatistics: false,
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'image', 'link'],
        ['code', 'codeblock'],
        ['scrollSync']
      ],
      hooks: {
        addImageBlobHook: async (blob, callback) => {
          if (!activeNoteId) {
            alert('Please create or select a note first');
            return;
          }
          
          updateStatus('syncing', t.syncing);
          
          try {
            const attachment = await saveAttachment(activeNoteId, blob);
            const attachmentBlob = await getAttachmentBlob(attachment);
            const url = URL.createObjectURL(attachmentBlob);
            
            // Store the attachment ID in the URL for reference
            callback(url, attachment.fileName);
            
            // Update note's attachment list
            await updateNoteAttachments();
            updateStatus('ready', t.ready);
          } catch (e) {
            console.error('Failed to save attachment:', e);
            updateStatus('error', t.error);
          }
        }
      },
      events: {
        change: () => {
          if (activeNoteId) {
            debouncedSave();
          }
        }
      }
    });

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          // Toast UI doesn't have dynamic theme switch, so we need to handle via CSS
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  // Debounced save
  function debouncedSave() {
    clearTimeout(saveTimeout);
    updateStatus('syncing', t.syncing);
    
    saveTimeout = setTimeout(async () => {
      await saveCurrentNote();
      updateStatus('ready', t.ready);
    }, 500);
  }

  // Save current note
  async function saveCurrentNote() {
    if (!activeNoteId || !editor) return;

    const note = await getNote(activeNoteId);
    if (!note) return;

    const content = editor.getMarkdown();
    note.content = content;
    note.title = getTitleFromContent(content);
    note.updatedAt = Date.now();

    await saveNote(note);
    
    // Update list without losing scroll position
    renderNotesList(searchInput.value);
  }

  async function updateNoteAttachments() {
    if (!activeNoteId) return;
    
    const note = await getNote(activeNoteId);
    if (!note) return;
    
    const attachments = await getAttachmentsForNote(activeNoteId);
    note.attachmentCount = attachments.length;
    await saveNote(note);
  }

  // Render notes list
  async function renderNotesList(filter = '') {
    let displayNotes = filter ? await searchNotes(filter) : notes;

    notesList.innerHTML = '';

    displayNotes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      if (note.id === activeNoteId) {
        noteItem.classList.add('active');
      }

      const attachmentBadge = note.attachmentCount 
        ? `<span class="note-item-attachments">${note.attachmentCount}</span>` 
        : '';

      noteItem.innerHTML = `
        <div class="note-item-title">${escapeHtml(note.title)}</div>
        <div class="note-item-meta">
          <span class="note-item-date">${formatDate(note.updatedAt)}</span>
          ${attachmentBadge}
          <span class="note-item-category">${t.category}</span>
        </div>
      `;

      noteItem.addEventListener('click', () => selectNote(note.id));
      
      // Right click to delete
      noteItem.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        if (confirm(t.confirmDelete)) {
          await deleteNoteById(note.id);
        }
      });

      notesList.appendChild(noteItem);
    });
  }

  // Select note
  async function selectNote(id) {
    // Save current note before switching
    if (activeNoteId && editor) {
      await saveCurrentNote();
    }

    const note = await getNote(id);
    if (!note) return;

    activeNoteId = id;
    localStorage.setItem('snotes-active', id);

    if (editor) {
      editor.setMarkdown(note.content || '');
    }

    hideEmptyState();
    renderNotesList(searchInput.value);
  }

  // Create new note
  async function createNewNote() {
    const newNote = {
      id: generateId(),
      title: t.untitled,
      content: '',
      tags: [],
      attachmentCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveNote(newNote);
    notes.unshift(newNote);
    renderNotesList(searchInput.value);
    selectNote(newNote.id);
    
    if (editor) {
      editor.focus();
    }
  }

  // Delete note
  async function deleteNoteById(id) {
    updateStatus('syncing', t.syncing);
    
    await deleteNote(id);
    notes = notes.filter(n => n.id !== id);

    if (id === activeNoteId) {
      if (notes.length > 0) {
        selectNote(notes[0].id);
      } else {
        activeNoteId = null;
        localStorage.removeItem('snotes-active');
        showEmptyState();
      }
    }

    renderNotesList(searchInput.value);
    updateStatus('ready', t.ready);
  }

  // Show/hide empty state
  function showEmptyState() {
    noteEditor.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }

  function hideEmptyState() {
    noteEditor.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  // Attach event listeners
  function attachEventListeners() {
    newNoteBtn.addEventListener('click', createNewNote);

    searchInput.addEventListener('input', (e) => {
      renderNotesList(e.target.value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + N: New note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }
      
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        // Only if not inside editor
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
    });
  }

  // Migrate from localStorage (old format) to IndexedDB
  async function migrateFromLocalStorage() {
    const oldData = localStorage.getItem('simple-notes-data');
    if (!oldData) return;

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
            updatedAt: oldNote.timestamp || Date.now()
          };
          await saveNote(newNote);
        }
        
        // Remove old data after successful migration
        localStorage.removeItem('simple-notes-data');
        localStorage.removeItem('simple-notes-active');
        console.log('Migration from localStorage completed');
      }
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }

  // Initialize
  async function init() {
    updateStatus('loading', t.loading);

    try {
      // Initialize storage
      await initDatabase();
      await initOPFS();

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
          updatedAt: Date.now()
        };
        
        await saveNote(welcomeNote);
        notes = [welcomeNote];
      }

      // Initialize editor
      initEditor();

      // Render UI
      renderNotesList();
      attachEventListeners();

      // Load active note or first note
      const savedActiveId = localStorage.getItem('snotes-active');
      if (savedActiveId && notes.find(n => n.id === savedActiveId)) {
        selectNote(savedActiveId);
      } else if (notes.length > 0) {
        selectNote(notes[0].id);
      } else {
        showEmptyState();
      }

      updateStatus('ready', t.ready);
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
})();
