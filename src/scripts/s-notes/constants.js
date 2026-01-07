// S-Notes Constants - Icons, Styles, Default Translations

export const ICONS = {
  delete:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="m14.5 8.5-5 5"/><path d="m9.5 8.5 5 5"/></svg>',
  openWindow:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  shareLink:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  starOutline:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  starFilled:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  chevronRight:
    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
};

export const TOOLBAR_BUTTON_STYLE = `
  font-size: 16px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin: 0;
  color: #6b6b6b;
`;

export const DEFAULT_TRANSLATIONS = {
  untitled: 'Untitled Note',
  category: 'Notes',
  confirmDelete: 'Are you sure you want to delete this note?',
  confirmDeleteWithChildren: 'This note has child notes. Delete this note and all its children?',
  noNotes: 'No notes yet. Click "New Note" to create one.',
  noFavorites: 'No favorite notes yet',
  loading: 'Loading...',
  ready: 'Ready',
  syncing: 'Syncing...',
  error: 'Error',
  attachments: 'Attachments',
  deleteAttachment: 'Delete attachment?',
  createChild: 'Create Note Item',
  addToFavorites: 'Add to Favorites',
  removeFromFavorites: 'Remove from Favorites',
  openInNewWindow: 'Open in new window',
  shareLink: 'Share link',
  shareLinkCopied: 'Share link copied to clipboard',
  delete: 'Delete',
};

// Get translations (from window or defaults)
export function getTranslations() {
  // @ts-ignore - notesTranslations is set dynamically by the page
  return window.notesTranslations || DEFAULT_TRANSLATIONS;
}
