// Background service worker for Web Tools Chrome Extension
// Manifest V3 requires service workers instead of background pages

const APP_LANG = 'en';

// Helper to build URL with .html extension
function buildAppUrl(tool = '') {
  let path;
  if (!tool) {
    // Home page - /app/en.html
    path = `app/${APP_LANG}.html`;
  } else {
    // Tool page - /app/en/path.html
    path = `app/${APP_LANG}/${tool}`;
    if (!tool.endsWith('.html') && !tool.endsWith('/')) {
      path += '.html';
    }
  }
  return chrome.runtime.getURL(path);
}

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Web Tools extension installed/updated:', details.reason);

  // Set default settings on first install
  if (details.reason === 'install') {
    chrome.storage.local.set({
      preferredLanguage: 'en',
      darkMode: true,
      recentTools: []
    });

    // Open welcome page on first install (optional)
    // chrome.tabs.create({ url: chrome.runtime.getURL(APP_BASE) });
  }

  // Create context menus
  createContextMenus();
});

// Create context menus for quick actions
function createContextMenus() {
  // Remove existing menus first
  chrome.contextMenus.removeAll(() => {
    // Parent menu
    chrome.contextMenus.create({
      id: 'webtools-parent',
      title: 'Web Tools',
      contexts: ['selection']
    });

    // Hash submenu
    chrome.contextMenus.create({
      id: 'webtools-hash-md5',
      parentId: 'webtools-parent',
      title: 'Hash with MD5',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'webtools-hash-sha256',
      parentId: 'webtools-parent',
      title: 'Hash with SHA256',
      contexts: ['selection']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'webtools-separator-1',
      parentId: 'webtools-parent',
      type: 'separator',
      contexts: ['selection']
    });

    // Encoding submenu
    chrome.contextMenus.create({
      id: 'webtools-encode-base64',
      parentId: 'webtools-parent',
      title: 'Encode to Base64',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'webtools-decode-base64',
      parentId: 'webtools-parent',
      title: 'Decode from Base64',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'webtools-encode-url',
      parentId: 'webtools-parent',
      title: 'URL Encode',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'webtools-decode-url',
      parentId: 'webtools-parent',
      title: 'URL Decode',
      contexts: ['selection']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'webtools-separator-2',
      parentId: 'webtools-parent',
      type: 'separator',
      contexts: ['selection']
    });

    // Open in Web Tools
    chrome.contextMenus.create({
      id: 'webtools-open',
      parentId: 'webtools-parent',
      title: 'Open in Web Tools',
      contexts: ['selection']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  
  if (!selectedText) {return;}

  const toolMap = {
    'webtools-hash-md5': 'hash/md5',
    'webtools-hash-sha256': 'hash/sha256',
    'webtools-encode-base64': 'encoding/base64_encode',
    'webtools-decode-base64': 'encoding/base64_decode',
    'webtools-encode-url': 'encoding/url_encode',
    'webtools-decode-url': 'encoding/url_decode',
    'webtools-open': ''
  };

  const tool = toolMap[info.menuItemId];
  
  if (tool !== undefined) {
    // Encode the selected text for URL
    const encodedText = encodeURIComponent(selectedText);
    const url = buildAppUrl(tool) + '?input=' + encodedText;
    
    chrome.tabs.create({ url });
  }
});

// Handle extension icon click (alternative to popup)
// chrome.action.onClicked.addListener((tab) => {
//   chrome.tabs.create({ url: chrome.runtime.getURL(APP_BASE) });
// });

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openTool') {
    const url = buildAppUrl(message.tool);
    chrome.tabs.create({ url });
    sendResponse({ success: true });
  }
  
  if (message.action === 'getSettings') {
    chrome.storage.local.get(['preferredLanguage', 'darkMode', 'recentTools'], (result) => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }

  if (message.action === 'saveRecentTool') {
    chrome.storage.local.get(['recentTools'], (result) => {
      let recentTools = result.recentTools || [];
      // Add to front, remove duplicates, keep max 10
      recentTools = [message.tool, ...recentTools.filter(t => t !== message.tool)].slice(0, 10);
      chrome.storage.local.set({ recentTools });
      sendResponse({ success: true });
    });
    return true;
  }
});

// Log when service worker starts
console.log('Web Tools background service worker started');
