// S-Notes Editor - Toast UI Editor initialization and management
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { getTranslations } from './constants.js';
import { getToolbarItems } from './ui/toolbar.js';

let editor = null;
let saveTimeout = null;

/**
 * Initialize Toast UI Editor
 */
export function initEditor(editorContainer, handlers) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const t = getTranslations();

  editor = new Editor({
    el: editorContainer,
    height: '450px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    theme: isDark ? 'dark' : 'light',
    placeholder: 'Start writing your note...',
    usageStatistics: false,
    toolbarItems: getToolbarItems({
      onOpenWindow: handlers.onOpenWindow,
      onToggleFavorite: handlers.onToggleFavorite,
      onDelete: handlers.onDelete,
    }),
    hooks: {
      addImageBlobHook: async (blob, callback) => {
        if (!handlers.getActiveNoteId()) {
          alert('Please create or select a note first');
          return;
        }

        handlers.updateStatus('syncing', t.syncing);

        try {
          const result = await handlers.onSaveAttachment(blob);
          callback(result.url, result.fileName);
          handlers.updateStatus('ready', t.ready);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to save attachment:', e);
          handlers.updateStatus('error', t.error);
        }
      },
    },
    events: {
      change: () => {
        if (handlers.getActiveNoteId()) {
          debouncedSave(handlers);
        }
      },
    },
  });

  // Watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        // Toast UI doesn't have dynamic theme switch, so we need to handle via CSS
        // Theme changes are applied via CSS selectors in the stylesheet
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  return editor;
}

/**
 * Debounced save
 */
function debouncedSave(handlers) {
  const t = getTranslations();
  clearTimeout(saveTimeout);
  handlers.updateStatus('syncing', t.syncing);

  saveTimeout = setTimeout(async () => {
    await handlers.onSave();
    handlers.updateStatus('ready', t.ready);
  }, 500);
}

/**
 * Get editor instance
 */
export function getEditor() {
  return editor;
}

/**
 * Get markdown content from editor
 */
export function getMarkdown() {
  return editor ? editor.getMarkdown() : '';
}

/**
 * Set markdown content in editor
 */
export function setMarkdown(content) {
  if (editor) {
    editor.setMarkdown(content);
  }
}

/**
 * Focus editor
 */
export function focusEditor() {
  if (editor) {
    editor.focus();
  }
}

/**
 * Generate HTML content for new window viewer
 */
export function generateViewerHtml(note, content, t) {
  return `
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
        const Editor = toastui.Editor;
        const viewer = Editor.factory({
          el: document.getElementById('viewer'),
          viewer: true,
          initialValue: \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
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
}
