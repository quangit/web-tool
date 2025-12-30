import ClipboardJS from 'clipboard';

// Initialize clipboard functionality for copy buttons
export function initClipboard() {
  if (typeof window.clipboardInitialized !== 'undefined') {
    return; // Already initialized
  }

  window.clipboardInitialized = true;

  const clipboard = new ClipboardJS('[data-toggle="copy"]');

  clipboard.on('success', function (e) {
    const message = e.trigger.getAttribute('data-message') || 'Copied to clipboard';

    if (typeof window.showMessage === 'function') {
      window.showMessage(message);
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'copy');
    }
    e.clearSelection();
  });

  clipboard.on('error', function () {
    if (typeof window.showMessage === 'function') {
      window.showMessage('Failed to copy', 'error');
    }
  });

  return clipboard;
}
