import {
  createAlignedDiff,
  calculateStats,
  type CompareOptions,
  type AlignedLine,
} from './diff-engine';

// State
let currentMode = 'text';
let leftFolderFiles = new Map<string, { content: string; path: string }>();
let rightFolderFiles = new Map<string, { content: string; path: string }>();
let isDiffView = false;

// DOM Elements
const elements = {
  modeSelect: document.getElementById('compare-mode') as HTMLSelectElement,
  modeText: document.getElementById('mode-text'),
  modeFile: document.getElementById('mode-file'),
  modeFolder: document.getElementById('mode-folder'),

  // Text Mode
  inputLeft: document.getElementById('input-left') as HTMLTextAreaElement,
  inputRight: document.getElementById('input-right') as HTMLTextAreaElement,
  textInputView: document.getElementById('text-input-view'),
  textDiffView: document.getElementById('text-diff-view'),
  diffLeft: document.getElementById('diff-left'),
  diffRight: document.getElementById('diff-right'),
  toggleViewBtn: document.getElementById('toggle-view-btn'),

  // File Mode
  fileLeft: document.getElementById('file-left') as HTMLInputElement,
  fileRight: document.getElementById('file-right') as HTMLInputElement,
  btnFileLeft: document.getElementById('btn-file-left'),
  btnFileRight: document.getElementById('btn-file-right'),
  fileNameLeft: document.getElementById('file-name-left'),
  fileNameRight: document.getElementById('file-name-right'),
  dropZoneLeft: document.getElementById('drop-zone-left'),
  dropZoneRight: document.getElementById('drop-zone-right'),
  fileEditorLeft: document.getElementById('file-editor-left'),
  fileEditorRight: document.getElementById('file-editor-right'),

  // Folder Mode
  folderLeft: document.getElementById('folder-left') as HTMLInputElement,
  folderRight: document.getElementById('folder-right') as HTMLInputElement,
  btnFolderLeft: document.getElementById('btn-folder-left'),
  btnFolderRight: document.getElementById('btn-folder-right'),
  folderNameLeft: document.getElementById('folder-name-left'),
  folderNameRight: document.getElementById('folder-name-right'),
  dropZoneFolderLeft: document.getElementById('drop-zone-folder-left'),
  dropZoneFolderRight: document.getElementById('drop-zone-folder-right'),
  folderTreeLeft: document.getElementById('folder-tree-left'),
  folderTreeRight: document.getElementById('folder-tree-right'),
  folderCompareResult: document.getElementById('folder-compare-result'),

  // Settings
  ignoreWhitespace: document.getElementById('ignore-whitespace') as HTMLInputElement,
  ignoreCase: document.getElementById('ignore-case') as HTMLInputElement,
  autoUpdate: document.getElementById('auto-update') as HTMLInputElement,
  executeBtn: document.getElementById('execute'),

  // Modal
  modal: document.getElementById('file-compare-modal'),
  modalClose: document.getElementById('modal-close'),
  modalTitle: document.getElementById('modal-file-title'),
  modalDiffOutput: document.getElementById('modal-diff-output'),
};

function getOptions(): CompareOptions {
  return {
    ignoreWhitespace: elements.ignoreWhitespace?.checked || false,
    ignoreCase: elements.ignoreCase?.checked || false,
  };
}

function updateStats(prefix: string, stats: { added: number; removed: number; unchanged: number }) {
  const addedEl = document.getElementById(`${prefix}-stat-added`);
  const removedEl = document.getElementById(`${prefix}-stat-removed`);
  const unchangedEl = document.getElementById(`${prefix}-stat-unchanged`);

  if (addedEl) {
    addedEl.textContent = `+${stats.added} added`;
  }
  if (removedEl) {
    removedEl.textContent = `-${stats.removed} removed`;
  }
  if (unchangedEl) {
    unchangedEl.textContent = `${stats.unchanged} unchanged`;
  }
}

function setupSyncScroll(container1: HTMLElement, container2: HTMLElement) {
  let isSyncing = false;

  container1.onscroll = function () {
    if (isSyncing) {
      return;
    }
    isSyncing = true;
    container2.scrollTop = container1.scrollTop;
    container2.scrollLeft = container1.scrollLeft;
    isSyncing = false;
  };

  container2.onscroll = function () {
    if (isSyncing) {
      return;
    }
    isSyncing = true;
    container1.scrollTop = container2.scrollTop;
    container1.scrollLeft = container2.scrollLeft;
    isSyncing = false;
  };
}

// --- Text Mode ---

function renderInlineDiff(
  leftText: string,
  rightText: string,
  leftContainer: HTMLElement,
  rightContainer: HTMLElement
) {
  leftContainer.innerHTML = '';
  rightContainer.innerHTML = '';

  if (!leftText && !rightText) {
    leftContainer.innerHTML = '<div class="no-diff">Enter text to compare</div>';
    rightContainer.innerHTML = '<div class="no-diff">Enter text to compare</div>';
    return;
  }

  const result = createAlignedDiff(leftText || '', rightText || '', getOptions());
  const stats = calculateStats(result.diff);
  updateStats('stat', stats);

  const renderLine = (line: AlignedLine, container: HTMLElement) => {
    const lineEl = document.createElement('div');
    lineEl.className = 'diff-line ' + line.type;

    const lineNumEl = document.createElement('span');
    lineNumEl.className = 'diff-line-number';
    lineNumEl.textContent = line.lineNum || '';

    const contentEl = document.createElement('span');
    contentEl.className = 'diff-line-content';
    if (line.content) {
      contentEl.textContent = line.content;
    } else {
      contentEl.innerHTML = '&nbsp;';
    }

    lineEl.appendChild(lineNumEl);
    lineEl.appendChild(contentEl);
    container.appendChild(lineEl);
  };

  result.leftLines.forEach((line) => renderLine(line, leftContainer));
  result.rightLines.forEach((line) => renderLine(line, rightContainer));

  setupSyncScroll(leftContainer, rightContainer);
}

function toggleDiffView() {
  isDiffView = !isDiffView;

  if (isDiffView) {
    elements.textInputView!.style.display = 'none';
    elements.textDiffView!.style.display = 'grid';
    elements.toggleViewBtn!.textContent = elements.toggleViewBtn!.dataset.editText || 'Edit Mode';

    renderInlineDiff(
      elements.inputLeft.value,
      elements.inputRight.value,
      elements.diffLeft!,
      elements.diffRight!
    );
  } else {
    elements.textInputView!.style.display = 'grid';
    elements.textDiffView!.style.display = 'none';
    elements.toggleViewBtn!.textContent = elements.toggleViewBtn!.dataset.diffText || 'Show Diff';
  }
}

// --- File Mode ---

let fileLeftContent = '';
let fileRightContent = '';

function renderCodeEditors(leftText: string, rightText: string) {
  if (!elements.fileEditorLeft || !elements.fileEditorRight) {
    return;
  }

  fileLeftContent = leftText || '';
  fileRightContent = rightText || '';

  const result = createAlignedDiff(fileLeftContent, fileRightContent, getOptions());
  const stats = calculateStats(result.diff);
  updateStats('file', stats);

  const renderEditor = (lines: AlignedLine[], container: HTMLElement, side: string) => {
    container.innerHTML = '';
    lines.forEach((line, idx) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'code-line ' + line.type;
      if (line.type !== 'empty') {
        lineEl.className += ' editable';
      }
      lineEl.dataset.index = idx.toString();
      lineEl.dataset.side = side;

      const lineNumEl = document.createElement('span');
      lineNumEl.className = 'code-line-number';
      lineNumEl.textContent = line.lineNum || '';

      const contentEl = document.createElement('span');
      contentEl.className = 'code-line-content';
      if (line.type !== 'empty') {
        contentEl.contentEditable = 'true';
        contentEl.spellcheck = false;
        contentEl.textContent = line.content;
      } else {
        contentEl.innerHTML = '&nbsp;';
      }

      lineEl.appendChild(lineNumEl);
      lineEl.appendChild(contentEl);
      container.appendChild(lineEl);
    });
  };

  renderEditor(result.leftLines, elements.fileEditorLeft, 'left');
  renderEditor(result.rightLines, elements.fileEditorRight, 'right');

  setupSyncScroll(elements.fileEditorLeft, elements.fileEditorRight);
}

function handleFileSelect(file: File, side: 'left' | 'right') {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (side === 'left') {
      fileLeftContent = content;
      if (elements.fileNameLeft) {
        elements.fileNameLeft.textContent = file.name;
      }
    } else {
      fileRightContent = content;
      if (elements.fileNameRight) {
        elements.fileNameRight.textContent = file.name;
      }
    }
    renderCodeEditors(fileLeftContent, fileRightContent);
  };
  reader.readAsText(file);
}

// --- Folder Mode ---

// Simplified folder handling for brevity - assuming flat structure or simple recursion
// In a real refactor, this would be more robust
async function handleFolderSelect(files: FileList, side: 'left' | 'right') {
  const fileMap = new Map<string, { content: string; path: string }>();
  const folderName = files[0]?.webkitRelativePath.split('/')[0] || 'Folder';

  if (side === 'left') {
    leftFolderFiles = fileMap;
    if (elements.folderNameLeft) {
      elements.folderNameLeft.textContent = folderName;
    }
  } else {
    rightFolderFiles = fileMap;
    if (elements.folderNameRight) {
      elements.folderNameRight.textContent = folderName;
    }
  }

  let processedCount = 0;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const relativePath = file.webkitRelativePath.split('/').slice(1).join('/'); // Remove root folder name
      fileMap.set(relativePath, { content, path: relativePath });

      processedCount++;
      if (processedCount === files.length) {
        renderFolderTree(side);
        compareFolders();
      }
    };
    reader.readAsText(file);
  });
}

function renderFolderTree(side: 'left' | 'right') {
  const container = side === 'left' ? elements.folderTreeLeft : elements.folderTreeRight;
  const files = side === 'left' ? leftFolderFiles : rightFolderFiles;

  if (!container) {
    return;
  }
  container.innerHTML = '';

  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.paddingLeft = '1rem';

  Array.from(files.keys())
    .sort()
    .forEach((path) => {
      const li = document.createElement('li');
      li.textContent = path;
      li.style.cursor = 'pointer';
      li.onclick = () => {
        const file = files.get(path);
        if (file) {
          showFileCompareModal(path, file.content, '');
        }
      };
      list.appendChild(li);
    });

  container.appendChild(list);
}

function compareFolders() {
  if (!elements.folderCompareResult) {
    return;
  }
  elements.folderCompareResult.innerHTML = '';

  const allPaths = new Set([...leftFolderFiles.keys(), ...rightFolderFiles.keys()]);
  const result = {
    added: [] as string[],
    removed: [] as string[],
    modified: [] as string[],
    unchanged: [] as string[],
  };

  allPaths.forEach((path) => {
    const left = leftFolderFiles.get(path);
    const right = rightFolderFiles.get(path);

    if (!left) {
      result.added.push(path);
    } else if (!right) {
      result.removed.push(path);
    } else if (left.content !== right.content) {
      result.modified.push(path);
    } else {
      result.unchanged.push(path);
    }
  });

  updateStats('folder', {
    added: result.added.length,
    removed: result.removed.length,
    unchanged: result.unchanged.length + result.modified.length, // Modified are counted in total files usually
  });

  const createItem = (path: string, type: string, label: string) => {
    const div = document.createElement('div');
    div.className = `folder-item ${type}`;
    div.textContent = `[${label}] ${path}`;
    div.onclick = () => {
      const left = leftFolderFiles.get(path)?.content || '';
      const right = rightFolderFiles.get(path)?.content || '';
      showFileCompareModal(path, left, right);
    };
    return div;
  };

  result.added.forEach((p) =>
    elements.folderCompareResult!.appendChild(createItem(p, 'added', 'Added'))
  );
  result.removed.forEach((p) =>
    elements.folderCompareResult!.appendChild(createItem(p, 'removed', 'Removed'))
  );
  result.modified.forEach((p) =>
    elements.folderCompareResult!.appendChild(createItem(p, 'modified', 'Modified'))
  );
  result.unchanged.forEach((p) =>
    elements.folderCompareResult!.appendChild(createItem(p, 'unchanged', 'Unchanged'))
  );
}

// --- Modal ---

function showFileCompareModal(title: string, left: string, right: string) {
  if (!elements.modal || !elements.modalDiffOutput) {
    return;
  }

  if (elements.modalTitle) {
    elements.modalTitle.textContent = title;
  }
  elements.modal.classList.remove('hidden');

  const result = createAlignedDiff(left, right, getOptions());
  const stats = calculateStats(result.diff);
  updateStats('modal', stats);

  // Render side-by-side in modal
  elements.modalDiffOutput.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'diff-view-container';
  wrapper.style.height = '100%';

  const leftPanel = document.createElement('div');
  leftPanel.className = 'diff-panel';
  const leftContent = document.createElement('div');
  leftContent.className = 'diff-panel-content sync-scroll';
  leftPanel.appendChild(leftContent);

  const rightPanel = document.createElement('div');
  rightPanel.className = 'diff-panel';
  const rightContent = document.createElement('div');
  rightContent.className = 'diff-panel-content sync-scroll';
  rightPanel.appendChild(rightContent);

  wrapper.appendChild(leftPanel);
  wrapper.appendChild(rightPanel);
  elements.modalDiffOutput.appendChild(wrapper);

  renderInlineDiff(left, right, leftContent, rightContent);
}

// --- Initialization ---

export function initCompare() {
  // Mode switching
  elements.modeSelect?.addEventListener('change', (e) => {
    currentMode = (e.target as HTMLSelectElement).value;
    [elements.modeText, elements.modeFile, elements.modeFolder].forEach(
      (el) => (el!.style.display = 'none')
    );

    if (currentMode === 'text') {
      elements.modeText!.style.display = 'block';
    } else if (currentMode === 'file') {
      elements.modeFile!.style.display = 'block';
    } else if (currentMode === 'folder') {
      elements.modeFolder!.style.display = 'block';
    }
  });

  // Text Mode Events
  elements.toggleViewBtn?.addEventListener('click', toggleDiffView);
  elements.executeBtn?.addEventListener('click', () => {
    if (currentMode === 'text') {
      if (isDiffView) {
        renderInlineDiff(
          elements.inputLeft.value,
          elements.inputRight.value,
          elements.diffLeft!,
          elements.diffRight!
        );
      }
    } else if (currentMode === 'file') {
      renderCodeEditors(fileLeftContent, fileRightContent);
    }
  });

  // File Mode Events
  elements.btnFileLeft?.addEventListener('click', () => elements.fileLeft.click());
  elements.btnFileRight?.addEventListener('click', () => elements.fileRight.click());

  elements.fileLeft?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleFileSelect(file, 'left');
    }
  });

  elements.fileRight?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleFileSelect(file, 'right');
    }
  });

  // Folder Mode Events
  elements.btnFolderLeft?.addEventListener('click', () => elements.folderLeft.click());
  elements.btnFolderRight?.addEventListener('click', () => elements.folderRight.click());

  // Note: webkitdirectory attribute is needed on input for folder selection
  elements.folderLeft?.setAttribute('webkitdirectory', '');
  elements.folderRight?.setAttribute('webkitdirectory', '');

  elements.folderLeft?.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      handleFolderSelect(files, 'left');
    }
  });

  elements.folderRight?.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      handleFolderSelect(files, 'right');
    }
  });

  // Modal Events
  elements.modalClose?.addEventListener('click', () => {
    elements.modal?.classList.add('hidden');
  });

  // Auto update
  [elements.ignoreWhitespace, elements.ignoreCase].forEach((el) => {
    el?.addEventListener('change', () => {
      if (elements.autoUpdate?.checked) {
        if (currentMode === 'text' && isDiffView) {
          renderInlineDiff(
            elements.inputLeft.value,
            elements.inputRight.value,
            elements.diffLeft!,
            elements.diffRight!
          );
        } else if (currentMode === 'file') {
          renderCodeEditors(fileLeftContent, fileRightContent);
        }
      }
    });
  });
}
