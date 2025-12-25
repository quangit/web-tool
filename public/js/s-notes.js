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
    // Clear caches before deleting
    cleanupNote();
    
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

  // ============================================  // GARBAGE COLLECTION & AUTO CLEANUP
  // ============================================

  // Find all image references in markdown content
  function findImageReferencesInContent(content) {
    if (!content) return new Set();
    
    const references = new Set();
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = imagePattern.exec(content)) !== null) {
      const [, altText, url] = match;
      
      // Extract filename from alt text or URL
      if (altText) references.add(altText);
      
      // Extract filename from blob URL or direct filename
      if (url.includes('blob:')) {
        // For blob URLs, we'll rely on alt text
        continue;
      } else {
        // Direct filename reference
        const filename = url.split('/').pop();
        if (filename) references.add(filename);
      }
    }
    
    return references;
  }

  // Scan all notes and find orphaned attachments
  async function findOrphanedAttachments() {
    try {
      const allNotes = await getAllNotes();
      const allAttachments = [];
      
      // Collect all attachments from all notes
      for (const note of allNotes) {
        const noteAttachments = await getAttachmentsForNote(note.id);
        allAttachments.push(...noteAttachments.map(att => ({...att, noteId: note.id})));
      }
      
      if (allAttachments.length === 0) return [];
      
      // Find all image references across all note contents
      const usedFilenames = new Set();
      const usedAttachmentIds = new Set();
      
      for (const note of allNotes) {
        const references = findImageReferencesInContent(note.content);
        references.forEach(ref => usedFilenames.add(ref));
        
        // Also check for attachment ID references in content
        allAttachments.forEach(att => {
          if (note.content && (
            note.content.includes(att.id) || 
            note.content.includes(att.fileName)
          )) {
            usedAttachmentIds.add(att.id);
          }
        });
      }
      
      // Find orphaned attachments
      const orphaned = allAttachments.filter(attachment => {
        return !usedFilenames.has(attachment.fileName) && 
               !usedAttachmentIds.has(attachment.id);
      });
      
      console.log(`Garbage Collection: Found ${orphaned.length} orphaned attachments out of ${allAttachments.length} total`);
      return orphaned;
      
    } catch (e) {
      console.error('Error finding orphaned attachments:', e);
      return [];
    }
  }

  // Delete orphaned attachments
  async function cleanupOrphanedAttachments() {
    try {
      const orphaned = await findOrphanedAttachments();
      
      if (orphaned.length === 0) {
        console.log('Garbage Collection: No orphaned attachments found');
        return { deleted: 0, errors: 0 };
      }
      
      let deleted = 0;
      let errors = 0;
      
      for (const attachment of orphaned) {
        try {
          await deleteAttachment(attachment.id);
          deleted++;
          console.log(`Deleted orphaned attachment: ${attachment.fileName}`);
        } catch (e) {
          console.error(`Failed to delete orphaned attachment ${attachment.id}:`, e);
          errors++;
        }
      }
      
      // Update attachment counts for affected notes
      const affectedNoteIds = new Set(orphaned.map(att => att.noteId));
      for (const noteId of affectedNoteIds) {
        try {
          await updateNoteAttachments(noteId);
        } catch (e) {
          console.warn(`Failed to update attachment count for note ${noteId}:`, e);
        }
      }
      
      console.log(`Garbage Collection Complete: Deleted ${deleted} orphaned attachments, ${errors} errors`);
      return { deleted, errors };
      
    } catch (e) {
      console.error('Error during cleanup:', e);
      return { deleted: 0, errors: 1 };
    }
  }

  // Schedule garbage collection
  let gcTimeout = null;
  function scheduleGarbageCollection(delay = 30000) { // 30 seconds default
    if (gcTimeout) {
      clearTimeout(gcTimeout);
    }
    
    gcTimeout = setTimeout(async () => {
      console.log('Running scheduled garbage collection...');
      await cleanupOrphanedAttachments();
      
      // Schedule next cleanup (every 5 minutes)
      scheduleGarbageCollection(300000);
    }, delay);
  }

  // Manual garbage collection trigger
  async function runManualGarbageCollection() {
    updateStatus('syncing', t.syncing || 'Cleaning up...');
    
    try {
      const result = await cleanupOrphanedAttachments();
      
      if (result.deleted > 0) {
        // Refresh UI if attachments were deleted
        await renderNotesList(searchInput?.value || '');
      }
      
      updateStatus('ready', t.ready);
      
      // Show result to user (could be enhanced with a toast notification)
      console.log(`Cleanup completed: ${result.deleted} files deleted`);
      
      return result;
    } catch (e) {
      console.error('Manual garbage collection failed:', e);
      updateStatus('error', t.error);
      throw e;
    }
  }

  // ============================================  // ATTACHMENT OPERATIONS (OPFS + IndexedDB)
  // ============================================

  // Cache for blob URLs to avoid recreation
  const imageUrlCache = new Map(); // attachmentId -> blob URL
  
  // Cache for attachment blobs
  const attachmentBlobCache = new Map(); // attachmentId -> blob

  // Clear caches when needed
  function clearImageCaches() {
    // Revoke old blob URLs
    imageUrlCache.forEach(url => {
      try { URL.revokeObjectURL(url); } catch (e) {}
    });
    imageUrlCache.clear();
    attachmentBlobCache.clear();
  }

  // Optimized restore image URLs with caching
  async function restoreImageUrls(noteId, content) {
    if (!content || !content.includes('![')) return content;
    
    const attachments = await getAttachmentsForNote(noteId);
    if (attachments.length === 0) return content;
    
    // Filter only image attachments upfront
    const imageAttachments = attachments.filter(att => 
      att.type && att.type.startsWith('image/')
    );
    
    if (imageAttachments.length === 0) return content;
    
    // Pre-load all image blobs in parallel for better performance
    const blobPromises = imageAttachments.map(async (attachment) => {
      if (attachmentBlobCache.has(attachment.id)) {
        return { attachment, blob: attachmentBlobCache.get(attachment.id) };
      }
      
      try {
        const blob = await getAttachmentBlob(attachment);
        if (blob) {
          attachmentBlobCache.set(attachment.id, blob);
          return { attachment, blob };
        }
      } catch (e) {
        console.warn('Failed to load blob for attachment:', attachment.id, e);
      }
      return null;
    });
    
    const loadedBlobs = (await Promise.all(blobPromises)).filter(Boolean);
    
    if (loadedBlobs.length === 0) return content;
    
    let updatedContent = content;
    
    // Simple and fast regex for image patterns
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    
    // Replace images efficiently
    updatedContent = updatedContent.replace(imagePattern, (match, altText, currentUrl) => {
      // Skip if it's already a valid blob URL that's cached
      if (currentUrl.startsWith('blob:') && 
          Array.from(imageUrlCache.values()).includes(currentUrl)) {
        return match;
      }
      
      // Find matching attachment - simple string matching first
      let matchedBlob = null;
      
      // Priority 1: Exact filename match in alt text
      matchedBlob = loadedBlobs.find(({ attachment }) => 
        altText === attachment.fileName
      );
      
      // Priority 2: Filename substring match
      if (!matchedBlob) {
        matchedBlob = loadedBlobs.find(({ attachment }) => 
          altText.includes(attachment.fileName) || 
          currentUrl.includes(attachment.fileName) ||
          currentUrl.includes(attachment.id)
        );
      }
      
      // Priority 3: Use first available image (fallback)
      if (!matchedBlob && loadedBlobs.length > 0) {
        matchedBlob = loadedBlobs[0];
        loadedBlobs.shift(); // Remove from array to avoid reuse
      }
      
      if (matchedBlob) {
        const { attachment, blob } = matchedBlob;
        
        // Use cached URL or create new one
        let blobUrl = imageUrlCache.get(attachment.id);
        if (!blobUrl) {
          blobUrl = URL.createObjectURL(blob);
          imageUrlCache.set(attachment.id, blobUrl);
        }
        
        return `![${attachment.fileName}](${blobUrl})`;
      }
      
      return match; // No changes if no match found
    });
    
    return updatedContent;
  }

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

  // ============================================
  // EDITOR & UI HELPERS
  // ============================================

  // Create custom delete button for Toast UI Editor
  function createDeleteButton() {
    const button = document.createElement('button');
    button.className = 'toastui-editor-toolbar-icons delete-note-btn';
    button.type = 'button';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-x-icon lucide-message-square-x"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="m14.5 8.5-5 5"/><path d="m9.5 8.5 5 5"/></svg>';
    button.title = 'Delete current note (Ctrl+Shift+D)';
    button.style.cssText = `
      font-size: 16px;
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px 4px;
      border-radius: 4px;
      margin: 0;
    `;
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(220, 53, 69, 0.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'none';
    });
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleDeleteCurrentNote();
    });
    
    return button;
  }

  // Create open in new window button
  function createOpenWindowButton() {
    const button = document.createElement('button');
    button.className = 'toastui-editor-toolbar-icons open-window-btn';
    button.type = 'button';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link-icon lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
    button.title = t.openInNewWindow || 'Open in new window';
    button.style.cssText = `
      font-size: 16px;
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px 4px;
      border-radius: 4px;
      margin: 0;
    `;
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(59, 130, 246, 0.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'none';
    });
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleOpenInNewWindow();
    });
    
    return button;
  }

  // Handle delete current note
  async function handleDeleteCurrentNote() {
    if (!activeNoteId) {
      alert(t.noNotes || 'No note selected');
      return;
    }

    const note = await getNote(activeNoteId);
    if (!note) return;

    const confirmMsg = `${t.confirmDelete || 'Are you sure you want to delete this note?'}\n\n"${note.title}"`;
    
    if (confirm(confirmMsg)) {
      const deletedId = activeNoteId;
      
      // Find next note to select
      let nextNote = null;
      const currentIndex = notes.findIndex(n => n.id === deletedId);
      
      if (notes.length > 1) {
        // Try next note, if not available then previous
        nextNote = notes[currentIndex + 1] || notes[currentIndex - 1];
      }
      
      try {
        updateStatus('syncing', t.syncing || 'Deleting...');
        
        // Delete the note
        await deleteNote(deletedId);
        
        // Remove from notes array
        const noteIndex = notes.findIndex(n => n.id === deletedId);
        if (noteIndex !== -1) {
          notes.splice(noteIndex, 1);
        }
        
        // Clear active note
        activeNoteId = null;
        localStorage.removeItem('snotes-active');
        
        // Select next note or show empty state
        if (nextNote) {
          await selectNote(nextNote.id);
        } else {
          // No notes left
          editor.setMarkdown('');
          showEmptyState();
          renderNotesList();
        }
        
        updateStatus('ready', t.ready);
        
        console.log(`Deleted note: ${note.title}`);
      } catch (e) {
        console.error('Failed to delete note:', e);
        updateStatus('error', t.error);
        alert('Failed to delete note. Please try again.');
      }
    }
  }

  // Handle open in new window
  async function handleOpenInNewWindow() {
    if (!activeNoteId) {
      alert(t.noNotes || 'No note selected');
      return;
    }

    const note = await getNote(activeNoteId);
    if (!note) return;

    try {
      // Create a new window with the note content
      const newWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
      
      if (!newWindow) {
        alert('Pop-up blocked. Please allow pop-ups for this site.');
        return;
      }

      // Get the current note content from editor
      const currentContent = editor ? editor.getMarkdown() : note.content;
      
      // Create the HTML content for the new window
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${note.title || t.untitled}</title>
          <link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css">
          <link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/theme/toastui-editor-dark.min.css">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: #fff;
            }
            .note-header {
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .note-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 10px 0;
              color: #333;
            }
            .note-meta {
              font-size: 14px;
              color: #666;
            }
            #viewer {
              min-height: 400px;
            }
            @media (prefers-color-scheme: dark) {
              body {
                background: #1a1a1a;
                color: #e0e0e0;
              }
              .note-title {
                color: #fff;
              }
              .note-meta {
                color: #aaa;
              }
              .note-header {
                border-bottom-color: #333;
              }
            }
          </style>
        </head>
        <body>
          <div class="note-header">
            <h1 class="note-title">${note.title || t.untitled}</h1>
            <div class="note-meta">
              Created: ${new Date(note.createdAt).toLocaleDateString()} | 
              Modified: ${new Date(note.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <div id="viewer"></div>
          
          <script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
          <script>
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const viewer = new toastui.Editor.factory({
              el: document.getElementById('viewer'),
              viewer: true,
              initialValue: \`${currentContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
              theme: isDark ? 'dark' : 'light'
            });
            
            // Auto-adjust theme
            if (window.matchMedia) {
              window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                // Toast UI doesn't support dynamic theme switching, so we reload
                location.reload();
              });
            }
          </script>
        </body>
        </html>
      `;

      // Write content to new window
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();

    } catch (e) {
      console.error('Failed to open in new window:', e);
      alert('Failed to open note in new window');
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
        ['scrollSync'],
        [{
          el: createOpenWindowButton(),
          name: 'openWindow',
          tooltip: 'Open in new window'
        }],
        [{
          el: createDeleteButton(),
          name: 'deleteNote',
          tooltip: 'Delete current note'
        }]
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
            
            // Add attachment ID as comment in the URL for easier restoration
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
    
    // Update local notes array to reflect changes in UI immediately
    const noteIndex = notes.findIndex(n => n.id === activeNoteId);
    if (noteIndex !== -1) {
      notes[noteIndex] = note;
    }

    await updateNoteAttachments();
    
    // Update list without losing scroll position
    renderNotesList(searchInput.value);
    
    // Auto cleanup after content changes (with delay to avoid frequent runs)
    scheduleGarbageCollection(60000); // 1 minute delay
  }

  async function updateNoteAttachments(noteId = null) {
    const targetNoteId = noteId || activeNoteId;
    if (!targetNoteId) return;
    
    const note = await getNote(targetNoteId);
    if (!note) return;
    
    const attachments = await getAttachmentsForNote(targetNoteId);
    note.attachmentCount = attachments.length;
    await saveNote(note);

    // Update local notes array
    const noteIndex = notes.findIndex(n => n.id === targetNoteId);
    if (noteIndex !== -1) {
      notes[noteIndex] = note;
    }
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
      // Restore image URLs before setting content
      const contentWithRestoredImages = await restoreImageUrls(id, note.content || '');
      editor.setMarkdown(contentWithRestoredImages);
    }

    hideEmptyState();
    renderNotesList(searchInput.value);
  }

  // Clean up when switching notes or deleting
  function cleanupNote() {
    // Clear caches to free memory
    clearImageCaches();
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
      
      // Start garbage collection schedule after successful initialization  
      console.log('Starting garbage collection scheduler...');
      scheduleGarbageCollection(30000); // Initial run after 30 seconds
      
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
    // Clear timeout to prevent running GC during unload
    if (gcTimeout) {
      clearTimeout(gcTimeout);
    }
    
    clearImageCaches();
    if (window.snotesImageUrls) {
      window.snotesImageUrls.forEach(url => {
        try { URL.revokeObjectURL(url); } catch (e) {}
      });
    }
  });

  // Expose garbage collection functions for debugging
  window.snotesGC = {
    findOrphaned: findOrphanedAttachments,
    cleanup: cleanupOrphanedAttachments,
    runManual: runManualGarbageCollection,
    schedule: scheduleGarbageCollection
  };
})();
