/* eslint-disable no-console */

const DB_NAME = 'snotes-db';
const DB_VERSION = 2;
const NOTES_STORE = 'notes';
const ATTACHMENTS_STORE = 'attachments';
const OPFS_DIR = 'snotes-files';

let db = null;
let opfsRoot = null;
let opfsDir = null;
let gcTimeout = null;
let attachmentUpdater = null;

const imageUrlCache = new Map(); // attachmentId -> blob URL
const attachmentBlobCache = new Map(); // attachmentId -> blob

export function setAttachmentUpdater(updater) {
  attachmentUpdater = updater;
}

// Initialize IndexedDB
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      const oldVersion = event.oldVersion;

      // Notes store with indexes for fast querying
      if (!database.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = database.createObjectStore(NOTES_STORE, { keyPath: 'id' });
        notesStore.createIndex('title', 'title', { unique: false });
        notesStore.createIndex('createdAt', 'createdAt', { unique: false });
        notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        notesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        notesStore.createIndex('parentId', 'parentId', { unique: false });
      } else if (oldVersion < 2) {
        // Upgrade from version 1: add parentId index
        const transaction = event.target.transaction;
        const notesStore = transaction.objectStore(NOTES_STORE);
        if (!notesStore.indexNames.contains('parentId')) {
          notesStore.createIndex('parentId', 'parentId', { unique: false });
        }
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
export async function initOPFS() {
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

export async function getAllNotes() {
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

export async function getNote(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readonly');
    const store = transaction.objectStore(NOTES_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveNote(note) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    const request = store.put(note);

    request.onsuccess = () => resolve(note);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteNote(id) {
  console.log('Deleting note from database:', id);

  clearImageCaches();

  const attachments = await getAttachmentsForNote(id);
  for (const attachment of attachments) {
    await deleteAttachment(attachment.id);
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('Note deleted from database successfully:', id);
      resolve();
    };
    request.onerror = () => {
      console.error('Failed to delete note from database:', id, request.error);
      reject(request.error);
    };

    // Wait for transaction to complete
    transaction.oncomplete = () => {
      console.log('Delete transaction completed for note:', id);
    };
    transaction.onerror = () => {
      console.error('Delete transaction failed for note:', id, transaction.error);
      reject(transaction.error);
    };
  });
}

export async function searchNotes(query) {
  const allNotes = await getAllNotes();
  const lowerQuery = query.toLowerCase();

  return allNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)))
  );
}

// Get all descendant note IDs (children, grandchildren, etc.)
export async function getDescendantIds(noteId, allNotes = null) {
  if (!allNotes) {
    allNotes = await getAllNotes();
  }
  const descendants = [];
  const stack = [noteId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    const children = allNotes.filter((n) => n.parentId === currentId);
    for (const child of children) {
      descendants.push(child.id);
      stack.push(child.id);
    }
  }

  return descendants;
}

// Delete note and all its descendants
export async function deleteNoteWithDescendants(id) {
  const allNotes = await getAllNotes();
  const descendantIds = await getDescendantIds(id, allNotes);
  const idsToDelete = [id, ...descendantIds];

  for (const noteId of idsToDelete) {
    await deleteNote(noteId);
  }

  return idsToDelete;
}

// Build tree structure from flat notes array
export function buildNotesTree(notesArray) {
  const noteMap = new Map();
  const rootNotes = [];

  // First pass: create map
  notesArray.forEach((note) => {
    noteMap.set(note.id, { ...note, children: [] });
  });

  // Second pass: build tree
  notesArray.forEach((note) => {
    const noteNode = noteMap.get(note.id);
    if (note.parentId && noteMap.has(note.parentId)) {
      noteMap.get(note.parentId).children.push(noteNode);
    } else {
      rootNotes.push(noteNode);
    }
  });

  // Sort children by updatedAt DESC
  const sortChildren = (node) => {
    node.children.sort((a, b) => b.updatedAt - a.updatedAt);
    node.children.forEach(sortChildren);
  };

  rootNotes.sort((a, b) => b.updatedAt - a.updatedAt);
  rootNotes.forEach(sortChildren);

  return rootNotes;
}

// Check if a note has children
export function hasChildren(noteId, notesArray) {
  return notesArray.some((n) => n.parentId === noteId);
}

// ============================================
// GARBAGE COLLECTION & AUTO CLEANUP
// ============================================

// Find all image references in markdown content
function findImageReferencesInContent(content) {
  if (!content) {
    return new Set();
  }

  const references = new Set();
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = imagePattern.exec(content)) !== null) {
    const [, altText, url] = match;

    if (altText) {
      references.add(altText);
    }

    if (url.includes('blob:')) {
      continue;
    } else {
      const filename = url.split('/').pop();
      if (filename) {
        references.add(filename);
      }
    }
  }

  return references;
}

// Scan all notes and find orphaned attachments
export async function findOrphanedAttachments() {
  try {
    const allNotes = await getAllNotes();
    const allAttachments = [];

    for (const note of allNotes) {
      const noteAttachments = await getAttachmentsForNote(note.id);
      allAttachments.push(...noteAttachments.map((att) => ({ ...att, noteId: note.id })));
    }

    if (allAttachments.length === 0) {
      return [];
    }

    const usedFilenames = new Set();
    const usedAttachmentIds = new Set();

    for (const note of allNotes) {
      const references = findImageReferencesInContent(note.content);
      references.forEach((ref) => usedFilenames.add(ref));

      allAttachments.forEach((att) => {
        if (
          note.content &&
          (note.content.includes(att.id) || note.content.includes(att.fileName))
        ) {
          usedAttachmentIds.add(att.id);
        }
      });
    }

    const orphaned = allAttachments.filter((attachment) => {
      return !usedFilenames.has(attachment.fileName) && !usedAttachmentIds.has(attachment.id);
    });

    console.log(
      `Garbage Collection: Found ${orphaned.length} orphaned attachments out of ${allAttachments.length} total`
    );
    return orphaned;
  } catch (e) {
    console.error('Error finding orphaned attachments:', e);
    return [];
  }
}

// Delete orphaned attachments
export async function cleanupOrphanedAttachments() {
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

    const affectedNoteIds = new Set(orphaned.map((att) => att.noteId));
    if (attachmentUpdater) {
      for (const noteId of affectedNoteIds) {
        try {
          await attachmentUpdater(noteId);
        } catch (e) {
          console.warn(`Failed to update attachment count for note ${noteId}:`, e);
        }
      }
    }

    console.log(
      `Garbage Collection Complete: Deleted ${deleted} orphaned attachments, ${errors} errors`
    );
    return { deleted, errors };
  } catch (e) {
    console.error('Error during cleanup:', e);
    return { deleted: 0, errors: 1 };
  }
}

export function scheduleGarbageCollection(delay = 30000) {
  if (gcTimeout) {
    clearTimeout(gcTimeout);
  }

  gcTimeout = setTimeout(async () => {
    console.log('Running scheduled garbage collection...');
    await cleanupOrphanedAttachments();
    scheduleGarbageCollection(300000);
  }, delay);
}

export function cancelGarbageCollection() {
  if (gcTimeout) {
    clearTimeout(gcTimeout);
    gcTimeout = null;
  }
}

// ============================================
// ATTACHMENT OPERATIONS (OPFS + IndexedDB)
// ============================================

export function clearImageCaches() {
  imageUrlCache.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore revoke errors */
    }
  });
  imageUrlCache.clear();
  attachmentBlobCache.clear();
}

// Optimized restore image URLs with caching
export async function restoreImageUrls(noteId, content) {
  if (!content || !content.includes('![')) {
    return content;
  }

  const attachments = await getAttachmentsForNote(noteId);
  if (attachments.length === 0) {
    return content;
  }

  const imageAttachments = attachments.filter((att) => att.type && att.type.startsWith('image/'));

  if (imageAttachments.length === 0) {
    return content;
  }

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

  if (loadedBlobs.length === 0) {
    return content;
  }

  let updatedContent = content;
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;

  updatedContent = updatedContent.replace(imagePattern, (match, altText, currentUrl) => {
    if (currentUrl.startsWith('blob:') && Array.from(imageUrlCache.values()).includes(currentUrl)) {
      return match;
    }

    let matchedBlob = null;
    matchedBlob = loadedBlobs.find(({ attachment }) => altText === attachment.fileName);

    if (!matchedBlob) {
      matchedBlob = loadedBlobs.find(
        ({ attachment }) =>
          altText.includes(attachment.fileName) ||
          currentUrl.includes(attachment.fileName) ||
          currentUrl.includes(attachment.id)
      );
    }

    if (!matchedBlob && loadedBlobs.length > 0) {
      matchedBlob = loadedBlobs[0];
      loadedBlobs.shift();
    }

    if (matchedBlob) {
      const { attachment, blob } = matchedBlob;

      let blobUrl = imageUrlCache.get(attachment.id);
      if (!blobUrl) {
        blobUrl = URL.createObjectURL(blob);
        imageUrlCache.set(attachment.id, blobUrl);
      }

      return `![${attachment.fileName}](${blobUrl})`;
    }

    return match;
  });

  return updatedContent;
}

export async function saveAttachment(noteId, file) {
  const id = generateId();
  const fileName = `${id}_${file.name}`;

  let filePath = null;
  let blobData = null;

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
    filePath,
    blobData,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ATTACHMENTS_STORE], 'readwrite');
    const store = transaction.objectStore(ATTACHMENTS_STORE);
    const request = store.put(attachmentMeta);

    request.onsuccess = () => resolve(attachmentMeta);
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachment(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ATTACHMENTS_STORE], 'readonly');
    const store = transaction.objectStore(ATTACHMENTS_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachmentBlob(attachment) {
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

export async function getAttachmentsForNote(noteId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ATTACHMENTS_STORE], 'readonly');
    const store = transaction.objectStore(ATTACHMENTS_STORE);
    const index = store.index('noteId');
    const request = index.getAll(noteId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAttachment(id) {
  const attachment = await getAttachment(id);

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
// UTILITIES
// ============================================

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
