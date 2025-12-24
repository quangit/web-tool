/**
 * S Notes - Smart Notes Application
 * A high-performance, local-first note-taking app with block-based editing,
 * Markdown support, nested folders, tags, and instant full-text search.
 */

(function() {
  'use strict';

  // Database configuration
  var DB_NAME = 's-notes-db';
  var DB_VERSION = 1;
  var STORE_NOTES = 'notes';
  var STORE_FOLDERS = 'folders';
  var STORE_TAGS = 'tags';
  var STORE_SETTINGS = 'settings';

  // App state
  var db = null;
  var currentNote = null;
  var currentView = 'all';
  var currentFolder = null;
  var currentTag = null;
  var notes = [];
  var folders = [];
  var tags = [];
  var searchQuery = '';
  var saveTimeout = null;
  var md = null;

  // DOM elements
  var elements = {};

  /**
   * Initialize the application
   */
  function SNotesApp() {
    var self = this;
    
    // Initialize markdown-it
    if (window.markdownit) {
      md = window.markdownit({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true
      });
    }

    // Cache DOM elements
    cacheElements();

    // Initialize database
    initDatabase().then(function() {
      // Load data
      return Promise.all([
        loadFolders(),
        loadTags(),
        loadNotes()
      ]);
    }).then(function() {
      // Render UI
      renderFolderTree();
      renderTagList();
      renderNoteList();
      
      // Bind events
      bindEvents();
      
      // Refresh icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }).catch(function(err) {
      console.error('Failed to initialize S Notes:', err);
    });
  }

  /**
   * Cache DOM elements for better performance
   */
  function cacheElements() {
    elements = {
      searchInput: document.getElementById('s-notes-search'),
      newNoteBtn: document.getElementById('new-note-btn'),
      newFolderBtn: document.getElementById('new-folder-btn'),
      folderTree: document.getElementById('folder-tree'),
      tagList: document.getElementById('tag-list'),
      noteList: document.getElementById('note-list'),
      listTitle: document.getElementById('list-title'),
      editor: document.getElementById('editor'),
      noteTitle: document.getElementById('note-title'),
      noteTags: document.getElementById('note-tags'),
      noteFolder: document.getElementById('note-folder'),
      addTagBtn: document.getElementById('add-tag-btn'),
      deleteNoteBtn: document.getElementById('delete-note-btn'),
      detachBtn: document.getElementById('detach-btn'),
      importBtn: document.getElementById('import-btn'),
      exportBtn: document.getElementById('export-btn'),
      importFile: document.getElementById('import-file'),
      preview: document.getElementById('preview'),
      tagDialog: document.getElementById('tag-dialog'),
      tagInput: document.getElementById('tag-input'),
      tagCancel: document.getElementById('tag-cancel'),
      tagSubmit: document.getElementById('tag-submit'),
      folderDialog: document.getElementById('folder-dialog'),
      folderInput: document.getElementById('folder-input'),
      parentFolderSelect: document.getElementById('parent-folder-select'),
      folderCancel: document.getElementById('folder-cancel'),
      folderSubmit: document.getElementById('folder-submit'),
      navItems: document.querySelectorAll('.s-notes-nav-item')
    };
  }

  /**
   * Initialize IndexedDB database
   */
  function initDatabase() {
    return new Promise(function(resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = function(event) {
        reject(event.target.error);
      };

      request.onsuccess = function(event) {
        db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = function(event) {
        var database = event.target.result;

        // Notes store
        if (!database.objectStoreNames.contains(STORE_NOTES)) {
          var notesStore = database.createObjectStore(STORE_NOTES, { keyPath: 'id' });
          notesStore.createIndex('folderId', 'folderId', { unique: false });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Folders store
        if (!database.objectStoreNames.contains(STORE_FOLDERS)) {
          var foldersStore = database.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
          foldersStore.createIndex('parentId', 'parentId', { unique: false });
        }

        // Tags store
        if (!database.objectStoreNames.contains(STORE_TAGS)) {
          database.createObjectStore(STORE_TAGS, { keyPath: 'id' });
        }

        // Settings store
        if (!database.objectStoreNames.contains(STORE_SETTINGS)) {
          database.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Generic database operations
   */
  function dbGet(storeName, id) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([storeName], 'readonly');
      var store = transaction.objectStore(storeName);
      var request = store.get(id);
      request.onsuccess = function() { resolve(request.result); };
      request.onerror = function() { reject(request.error); };
    });
  }

  function dbGetAll(storeName) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([storeName], 'readonly');
      var store = transaction.objectStore(storeName);
      var request = store.getAll();
      request.onsuccess = function() { resolve(request.result); };
      request.onerror = function() { reject(request.error); };
    });
  }

  function dbPut(storeName, data) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([storeName], 'readwrite');
      var store = transaction.objectStore(storeName);
      var request = store.put(data);
      request.onsuccess = function() { resolve(request.result); };
      request.onerror = function() { reject(request.error); };
    });
  }

  function dbDelete(storeName, id) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([storeName], 'readwrite');
      var store = transaction.objectStore(storeName);
      var request = store.delete(id);
      request.onsuccess = function() { resolve(); };
      request.onerror = function() { reject(request.error); };
    });
  }

  /**
   * Generate unique ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Load notes from database
   */
  function loadNotes() {
    return dbGetAll(STORE_NOTES).then(function(data) {
      notes = data.sort(function(a, b) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      return notes;
    });
  }

  /**
   * Load folders from database
   */
  function loadFolders() {
    return dbGetAll(STORE_FOLDERS).then(function(data) {
      folders = data;
      return folders;
    });
  }

  /**
   * Load tags from database
   */
  function loadTags() {
    return dbGetAll(STORE_TAGS).then(function(data) {
      tags = data;
      return tags;
    });
  }

  /**
   * Create a new note
   */
  function createNote() {
    var note = {
      id: generateId(),
      title: '',
      content: '',
      folderId: currentFolder,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return dbPut(STORE_NOTES, note).then(function() {
      notes.unshift(note);
      renderNoteList();
      selectNote(note);
      elements.noteTitle.focus();
      return note;
    });
  }

  /**
   * Save current note
   */
  function saveNote() {
    if (!currentNote) return Promise.resolve();

    currentNote.updatedAt = new Date().toISOString();
    
    return dbPut(STORE_NOTES, currentNote).then(function() {
      // Update notes array
      var index = notes.findIndex(function(n) { return n.id === currentNote.id; });
      if (index > -1) {
        notes[index] = currentNote;
        // Move to top
        notes.splice(index, 1);
        notes.unshift(currentNote);
      }
      renderNoteList();
    });
  }

  /**
   * Delete a note
   */
  function deleteNote(id) {
    var i18n = window.sNotesI18n || {};
    if (!confirm(i18n.delete_confirm || 'Are you sure you want to delete this note?')) {
      return Promise.resolve();
    }

    return dbDelete(STORE_NOTES, id).then(function() {
      notes = notes.filter(function(n) { return n.id !== id; });
      if (currentNote && currentNote.id === id) {
        currentNote = null;
        clearEditor();
      }
      renderNoteList();
    });
  }

  /**
   * Select a note for editing
   */
  function selectNote(note) {
    currentNote = note;
    
    // Update UI
    elements.noteTitle.value = note.title || '';
    elements.editor.innerHTML = note.content || '';
    
    // Update folder select
    elements.noteFolder.value = note.folderId || '';
    
    // Update tags display
    renderNoteTags();
    
    // Mark as active in list
    var items = elements.noteList.querySelectorAll('.s-notes-item');
    items.forEach(function(item) {
      item.classList.toggle('active', item.dataset.id === note.id);
    });

    // Update preview
    updatePreview();
  }

  /**
   * Clear editor
   */
  function clearEditor() {
    elements.noteTitle.value = '';
    elements.editor.innerHTML = '';
    elements.noteTags.innerHTML = '<button id="add-tag-btn" class="s-notes-add-tag"><i data-lucide="plus"></i><span>Add tag</span></button>';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Create a new folder
   */
  function createFolder(name, parentId) {
    var folder = {
      id: generateId(),
      name: name,
      parentId: parentId || null,
      createdAt: new Date().toISOString()
    };

    return dbPut(STORE_FOLDERS, folder).then(function() {
      folders.push(folder);
      renderFolderTree();
      updateFolderSelect();
      return folder;
    });
  }

  /**
   * Delete a folder
   */
  function deleteFolder(id) {
    var i18n = window.sNotesI18n || {};
    if (!confirm(i18n.delete_folder_confirm || 'Are you sure you want to delete this folder and all its contents?')) {
      return Promise.resolve();
    }

    // Get all child folders recursively
    function getChildFolderIds(parentId) {
      var ids = [parentId];
      var children = folders.filter(function(f) { return f.parentId === parentId; });
      children.forEach(function(child) {
        ids = ids.concat(getChildFolderIds(child.id));
      });
      return ids;
    }

    var folderIds = getChildFolderIds(id);
    
    // Delete all notes in these folders
    var notesToDelete = notes.filter(function(n) {
      return folderIds.indexOf(n.folderId) > -1;
    });

    var promises = folderIds.map(function(fId) {
      return dbDelete(STORE_FOLDERS, fId);
    });

    promises = promises.concat(notesToDelete.map(function(n) {
      return dbDelete(STORE_NOTES, n.id);
    }));

    return Promise.all(promises).then(function() {
      folders = folders.filter(function(f) {
        return folderIds.indexOf(f.id) === -1;
      });
      notes = notes.filter(function(n) {
        return folderIds.indexOf(n.folderId) === -1;
      });
      if (currentNote && folderIds.indexOf(currentNote.folderId) > -1) {
        currentNote = null;
        clearEditor();
      }
      renderFolderTree();
      renderNoteList();
      updateFolderSelect();
    });
  }

  /**
   * Create or get a tag
   */
  function createTag(name) {
    var existing = tags.find(function(t) {
      return t.name.toLowerCase() === name.toLowerCase();
    });
    if (existing) return Promise.resolve(existing);

    var tag = {
      id: generateId(),
      name: name,
      color: getRandomColor()
    };

    return dbPut(STORE_TAGS, tag).then(function() {
      tags.push(tag);
      renderTagList();
      return tag;
    });
  }

  /**
   * Add tag to current note
   */
  function addTagToNote(tagId) {
    if (!currentNote) return;
    if (currentNote.tags.indexOf(tagId) > -1) return;

    currentNote.tags.push(tagId);
    saveNote();
    renderNoteTags();
  }

  /**
   * Remove tag from current note
   */
  function removeTagFromNote(tagId) {
    if (!currentNote) return;

    currentNote.tags = currentNote.tags.filter(function(t) { return t !== tagId; });
    saveNote();
    renderNoteTags();
  }

  /**
   * Get random color for tag
   */
  function getRandomColor() {
    var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Render folder tree
   */
  function renderFolderTree() {
    var html = buildFolderTreeHTML(null, 0);
    elements.folderTree.innerHTML = html || '<div class="s-notes-folder-empty">No folders</div>';
    
    // Bind folder click events
    elements.folderTree.querySelectorAll('.s-notes-folder-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var folderId = this.dataset.id;
        setView('folder', folderId);
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function buildFolderTreeHTML(parentId, level) {
    var childFolders = folders.filter(function(f) { return f.parentId === parentId; });
    if (childFolders.length === 0) return '';

    var html = '';
    childFolders.forEach(function(folder) {
      var activeClass = currentFolder === folder.id ? ' active' : '';
      html += '<div class="s-notes-folder-item' + activeClass + '" data-id="' + folder.id + '">';
      html += '<i data-lucide="folder"></i>';
      html += '<span>' + escapeHtml(folder.name) + '</span>';
      html += '</div>';
      
      var children = buildFolderTreeHTML(folder.id, level + 1);
      if (children) {
        html += '<div class="s-notes-folder-children">' + children + '</div>';
      }
    });

    return html;
  }

  /**
   * Render tag list
   */
  function renderTagList() {
    if (tags.length === 0) {
      elements.tagList.innerHTML = '<div class="s-notes-tag-empty">No tags</div>';
      return;
    }

    var html = tags.map(function(tag) {
      var activeClass = currentTag === tag.id ? ' active' : '';
      return '<span class="s-notes-tag' + activeClass + '" data-id="' + tag.id + '">' +
        '<span class="s-notes-tag-dot" style="background:' + tag.color + '"></span>' +
        escapeHtml(tag.name) +
        '</span>';
    }).join('');

    elements.tagList.innerHTML = html;

    // Bind tag click events
    elements.tagList.querySelectorAll('.s-notes-tag').forEach(function(item) {
      item.addEventListener('click', function() {
        var tagId = this.dataset.id;
        setView('tag', tagId);
      });
    });
  }

  /**
   * Render note list
   */
  function renderNoteList() {
    var filteredNotes = getFilteredNotes();
    var i18n = window.sNotesI18n || {};

    if (filteredNotes.length === 0) {
      var message = searchQuery ? (i18n.no_results || 'No matching notes found') : (i18n.no_notes || 'No notes yet. Create your first note!');
      elements.noteList.innerHTML = '<div class="s-notes-empty"><i data-lucide="notebook-pen"></i><p>' + message + '</p></div>';
      if (window.lucide) {
        window.lucide.createIcons();
      }
      return;
    }

    var html = filteredNotes.map(function(note) {
      var activeClass = currentNote && currentNote.id === note.id ? ' active' : '';
      var preview = getTextPreview(note.content, 80);
      var noteTags = note.tags.map(function(tagId) {
        var tag = tags.find(function(t) { return t.id === tagId; });
        return tag ? '<span class="s-notes-item-tag">' + escapeHtml(tag.name) + '</span>' : '';
      }).join('');

      return '<div class="s-notes-item' + activeClass + '" data-id="' + note.id + '">' +
        '<div class="s-notes-item-title">' + escapeHtml(note.title || (i18n.untitled || 'Untitled')) + '</div>' +
        '<div class="s-notes-item-preview">' + escapeHtml(preview) + '</div>' +
        '<div class="s-notes-item-meta">' +
          '<span>' + formatDate(note.updatedAt) + '</span>' +
          (noteTags ? '<div class="s-notes-item-tags">' + noteTags + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    elements.noteList.innerHTML = html;

    // Bind note click events
    elements.noteList.querySelectorAll('.s-notes-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var noteId = this.dataset.id;
        var note = notes.find(function(n) { return n.id === noteId; });
        if (note) selectNote(note);
      });
    });
  }

  /**
   * Render note tags in editor
   */
  function renderNoteTags() {
    if (!currentNote) return;

    var html = currentNote.tags.map(function(tagId) {
      var tag = tags.find(function(t) { return t.id === tagId; });
      if (!tag) return '';
      return '<span class="s-notes-note-tag">' +
        escapeHtml(tag.name) +
        '<button data-tag-id="' + tag.id + '"><i data-lucide="x"></i></button>' +
      '</span>';
    }).join('');

    html += '<button id="add-tag-btn" class="s-notes-add-tag"><i data-lucide="plus"></i><span>Add tag</span></button>';
    elements.noteTags.innerHTML = html;

    // Rebind add tag button
    document.getElementById('add-tag-btn').addEventListener('click', function() {
      showTagDialog();
    });

    // Bind remove tag buttons
    elements.noteTags.querySelectorAll('[data-tag-id]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeTagFromNote(this.dataset.tagId);
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Update folder select dropdown
   */
  function updateFolderSelect() {
    var html = '<option value="">No folder</option>';
    
    function addFolderOptions(parentId, prefix) {
      var childFolders = folders.filter(function(f) { return f.parentId === parentId; });
      childFolders.forEach(function(folder) {
        html += '<option value="' + folder.id + '">' + prefix + escapeHtml(folder.name) + '</option>';
        addFolderOptions(folder.id, prefix + '— ');
      });
    }
    
    addFolderOptions(null, '');
    elements.noteFolder.innerHTML = html;
    elements.parentFolderSelect.innerHTML = html;

    if (currentNote) {
      elements.noteFolder.value = currentNote.folderId || '';
    }
  }

  /**
   * Get filtered notes based on current view and search
   */
  function getFilteredNotes() {
    var filtered = notes;

    // Filter by view
    if (currentView === 'folder' && currentFolder) {
      filtered = filtered.filter(function(n) { return n.folderId === currentFolder; });
    } else if (currentView === 'tag' && currentTag) {
      filtered = filtered.filter(function(n) { return n.tags.indexOf(currentTag) > -1; });
    }

    // Filter by search query
    if (searchQuery) {
      var query = searchQuery.toLowerCase();
      filtered = filtered.filter(function(n) {
        return (n.title && n.title.toLowerCase().indexOf(query) > -1) ||
               (n.content && getTextContent(n.content).toLowerCase().indexOf(query) > -1);
      });
    }

    return filtered;
  }

  /**
   * Set current view
   */
  function setView(view, id) {
    currentView = view;
    currentFolder = view === 'folder' ? id : null;
    currentTag = view === 'tag' ? id : null;

    var i18n = window.sNotesI18n || {};

    // Update list title
    if (view === 'all') {
      elements.listTitle.textContent = i18n.all_notes || 'All Notes';
    } else if (view === 'folder') {
      var folder = folders.find(function(f) { return f.id === id; });
      elements.listTitle.textContent = folder ? folder.name : 'Folder';
    } else if (view === 'tag') {
      var tag = tags.find(function(t) { return t.id === id; });
      elements.listTitle.textContent = tag ? '#' + tag.name : 'Tag';
    }

    // Update active states
    elements.navItems.forEach(function(item) {
      item.classList.toggle('active', item.dataset.view === view && view === 'all');
    });

    renderFolderTree();
    renderTagList();
    renderNoteList();
  }

  /**
   * Show tag dialog
   */
  function showTagDialog() {
    elements.tagInput.value = '';
    elements.tagDialog.showModal();
    elements.tagInput.focus();
  }

  /**
   * Show folder dialog
   */
  function showFolderDialog() {
    elements.folderInput.value = '';
    updateFolderSelect();
    elements.folderDialog.showModal();
    elements.folderInput.focus();
  }

  /**
   * Update preview
   */
  function updatePreview() {
    if (!currentNote || !md) return;
    
    var content = elements.editor.innerText || '';
    var html = md.render(content);
    elements.preview.innerHTML = html;
  }

  /**
   * Export all notes
   */
  function exportNotes() {
    var data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes: notes,
      folders: folders,
      tags: tags
    };

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 's-notes-export-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import notes
   */
  function importNotes(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        
        if (!data.notes || !Array.isArray(data.notes)) {
          throw new Error('Invalid export file');
        }

        // Import folders first
        var folderPromises = (data.folders || []).map(function(folder) {
          folder.id = generateId(); // Generate new ID to avoid conflicts
          return dbPut(STORE_FOLDERS, folder);
        });

        // Import tags
        var tagPromises = (data.tags || []).map(function(tag) {
          tag.id = generateId();
          return dbPut(STORE_TAGS, tag);
        });

        // Import notes
        var notePromises = data.notes.map(function(note) {
          note.id = generateId();
          note.folderId = null; // Reset folder association
          note.tags = []; // Reset tags
          return dbPut(STORE_NOTES, note);
        });

        Promise.all(folderPromises.concat(tagPromises).concat(notePromises)).then(function() {
          return Promise.all([loadFolders(), loadTags(), loadNotes()]);
        }).then(function() {
          renderFolderTree();
          renderTagList();
          renderNoteList();
          updateFolderSelect();
          if (window.showMessage) {
            window.showMessage('Import successful!');
          }
        });
      } catch (err) {
        console.error('Import failed:', err);
        if (window.showMessage) {
          window.showMessage('Import failed: ' + err.message, true);
        }
      }
    };
    reader.readAsText(file);
  }

  /**
   * Detach note to new window
   */
  function detachNote() {
    if (!currentNote) return;

    var content = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + 
      escapeHtml(currentNote.title || 'S Notes') + 
      '</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:40px;max-width:800px;margin:0 auto;line-height:1.6;}h1{border-bottom:1px solid #eee;padding-bottom:10px;}</style></head><body>';
    
    if (md) {
      content += '<h1>' + escapeHtml(currentNote.title || 'Untitled') + '</h1>';
      content += md.render(elements.editor.innerText || '');
    } else {
      content += '<h1>' + escapeHtml(currentNote.title || 'Untitled') + '</h1>';
      content += '<pre>' + escapeHtml(elements.editor.innerText || '') + '</pre>';
    }
    
    content += '</body></html>';

    var blob = new Blob([content], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'width=800,height=600');
  }

  /**
   * Bind event handlers
   */
  function bindEvents() {
    // Search
    var searchDebounce = null;
    elements.searchInput.addEventListener('input', function() {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(function() {
        searchQuery = elements.searchInput.value.trim();
        renderNoteList();
      }, 150);
    });

    // New note button
    elements.newNoteBtn.addEventListener('click', function() {
      createNote();
    });

    // New folder button
    elements.newFolderBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showFolderDialog();
    });

    // Navigation items
    elements.navItems.forEach(function(item) {
      item.addEventListener('click', function() {
        setView(this.dataset.view);
      });
    });

    // Note title change
    elements.noteTitle.addEventListener('input', function() {
      if (!currentNote) return;
      currentNote.title = this.value;
      debouncedSave();
    });

    // Editor content change
    elements.editor.addEventListener('input', function() {
      if (!currentNote) return;
      currentNote.content = this.innerHTML;
      debouncedSave();
      updatePreview();
    });

    // Editor keyboard shortcuts
    elements.editor.addEventListener('keydown', function(e) {
      handleEditorKeydown(e);
    });

    // Folder select change
    elements.noteFolder.addEventListener('change', function() {
      if (!currentNote) return;
      currentNote.folderId = this.value || null;
      saveNote();
    });

    // Delete note button
    elements.deleteNoteBtn.addEventListener('click', function() {
      if (currentNote) {
        deleteNote(currentNote.id);
      }
    });

    // Detach button
    elements.detachBtn.addEventListener('click', function() {
      detachNote();
    });

    // Import/Export
    elements.importBtn.addEventListener('click', function() {
      elements.importFile.click();
    });

    elements.importFile.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        importNotes(this.files[0]);
        this.value = '';
      }
    });

    elements.exportBtn.addEventListener('click', function() {
      exportNotes();
    });

    // Tag dialog
    elements.tagCancel.addEventListener('click', function() {
      elements.tagDialog.close();
    });

    elements.tagDialog.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      var tagName = elements.tagInput.value.trim();
      if (tagName) {
        createTag(tagName).then(function(tag) {
          addTagToNote(tag.id);
          elements.tagDialog.close();
        });
      }
    });

    // Folder dialog
    elements.folderCancel.addEventListener('click', function() {
      elements.folderDialog.close();
    });

    elements.folderDialog.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      var folderName = elements.folderInput.value.trim();
      var parentId = elements.parentFolderSelect.value || null;
      if (folderName) {
        createFolder(folderName, parentId).then(function() {
          elements.folderDialog.close();
        });
      }
    });

    // Add tag button (initial binding)
    elements.addTagBtn.addEventListener('click', function() {
      showTagDialog();
    });

    // Initialize folder select
    updateFolderSelect();
  }

  /**
   * Handle editor keyboard shortcuts
   */
  function handleEditorKeydown(e) {
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold', false, null);
    }
    // Ctrl/Cmd + I for italic
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic', false, null);
    }
    // Ctrl/Cmd + U for underline
    else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline', false, null);
    }
    // Auto-format headings
    else if (e.key === ' ') {
      handleAutoFormat();
    }
  }

  /**
   * Handle auto-formatting (e.g., # for headings)
   */
  function handleAutoFormat() {
    var selection = window.getSelection();
    if (!selection.rangeCount) return;

    var range = selection.getRangeAt(0);
    var node = range.startContainer;
    
    if (node.nodeType === Node.TEXT_NODE) {
      var text = node.textContent;
      var offset = range.startOffset;
      var lineStart = text.lastIndexOf('\n', offset - 1) + 1;
      var lineText = text.substring(lineStart, offset);

      // Heading detection
      if (lineText === '#') {
        // Will be handled by markdown rendering
      }
      // Todo item
      else if (lineText === '[]' || lineText === '[ ]') {
        // Could implement checkbox conversion here
      }
    }
  }

  /**
   * Debounced save
   */
  function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() {
      saveNote();
    }, 500);
  }

  /**
   * Utility: Escape HTML
   */
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Utility: Get text content from HTML
   */
  function getTextContent(html) {
    if (!html) return '';
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Utility: Get text preview
   */
  function getTextPreview(html, maxLength) {
    var text = getTextContent(html);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Utility: Format date
   */
  function formatDate(dateStr) {
    var date = new Date(dateStr);
    var now = new Date();
    var diff = now - date;
    var day = 24 * 60 * 60 * 1000;

    if (diff < day) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * day) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  }

  // Export to global scope
  window.SNotesApp = SNotesApp;

})();
