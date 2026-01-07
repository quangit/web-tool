/**
 * Build script for Web Tools Chrome Extension
 *
 * This script:
 * 1. Builds the Astro app
 * 2. Copies the build output to chrome-extension/app/
 * 3. Copies extension files (manifest, popup, background)
 * 4. Downloads CDN libraries locally (for CSP compliance)
 * 5. Extracts inline scripts to external files (for CSP compliance)
 * 6. Creates a ready-to-load extension package
 */

import { execSync } from 'child_process';
import {
  cpSync,
  rmSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const EXTENSION_DIR = join(ROOT_DIR, 'chrome-extension');
const OUTPUT_DIR = join(ROOT_DIR, 'chrome-extension-build');

console.log('🚀 Building Web Tools Chrome Extension...\n');

// Step 1: Clean previous build
console.log('📦 Step 1: Cleaning previous build...');
if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUTPUT_DIR, { recursive: true });

// Step 2: Build Astro app
console.log('🔨 Step 2: Building Astro app...');
// Astro check may exit with code 1 for warnings, so we catch and verify dist folder
try {
  execSync('pnpm run build', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: { ...process.env, BUILD_FOR_EXTENSION: 'true' },
  });
} catch (error) {
  // Continue - will check if dist exists below
}

// Verify dist folder exists (build may have warnings but still succeed)
if (!existsSync(DIST_DIR) || readdirSync(DIST_DIR).length === 0) {
  console.error('❌ Failed to build Astro app - dist folder is empty or missing');
  process.exit(1);
}
console.log('✓ Astro build completed');

// Step 3: Copy Astro build to extension
console.log('📋 Step 3: Copying Astro build to extension...');
const appDir = join(OUTPUT_DIR, 'app');
mkdirSync(appDir, { recursive: true });
cpSync(DIST_DIR, appDir, { recursive: true });

// Remove web app manifest to avoid conflict with extension manifest
const webAppManifest = join(appDir, 'manifest.json');
if (existsSync(webAppManifest)) {
  rmSync(webAppManifest);
  console.log('✓ Removed app/manifest.json (web app manifest) to avoid Chrome Store conflict');
}

// Step 4: Copy extension files
console.log('📋 Step 4: Copying extension files...');

// Copy manifest.json
copyFileSync(join(EXTENSION_DIR, 'manifest.json'), join(OUTPUT_DIR, 'manifest.json'));

// Copy popup folder
const popupSrc = join(EXTENSION_DIR, 'popup');
const popupDest = join(OUTPUT_DIR, 'popup');
if (existsSync(popupSrc)) {
  cpSync(popupSrc, popupDest, { recursive: true });
}

// Copy background.js
copyFileSync(join(EXTENSION_DIR, 'background.js'), join(OUTPUT_DIR, 'background.js'));

// Copy icons folder if exists
const iconsSrc = join(EXTENSION_DIR, 'icons');
const iconsDest = join(OUTPUT_DIR, 'icons');
if (existsSync(iconsSrc)) {
  cpSync(iconsSrc, iconsDest, { recursive: true });
} else {
  // Create placeholder icons folder with instructions
  mkdirSync(iconsDest, { recursive: true });
  console.log('⚠️  Icons folder not found. Please add icons to chrome-extension/icons/');
}

// Step 5: Copy static assets to root (for absolute path references in HTML)
console.log('📋 Step 5: Copying static assets to extension root...');
const staticFolders = ['css', 'js', 'images'];
for (const folder of staticFolders) {
  const srcPath = join(appDir, folder);
  const destPath = join(OUTPUT_DIR, folder);
  if (existsSync(srcPath)) {
    cpSync(srcPath, destPath, { recursive: true });
    console.log(`   ✓ Copied ${folder}/`);
  }
}

// Handle _astro folder - rename to 'astro' (Chrome doesn't allow _ prefix)
const astroSrc = join(appDir, '_astro');
const astroDest = join(OUTPUT_DIR, 'astro');
if (existsSync(astroSrc)) {
  cpSync(astroSrc, astroDest, { recursive: true });
  console.log(`   ✓ Copied _astro/ -> astro/`);
}

// Also copy to app folder with renamed name
const astroDestApp = join(appDir, 'astro');
if (existsSync(astroSrc)) {
  cpSync(astroSrc, astroDestApp, { recursive: true });
  // Remove original _astro from app folder
  rmSync(astroSrc, { recursive: true, force: true });
}

// Step 6: Download CDN libraries locally (Chrome Extension CSP requirement)
console.log('📋 Step 6: Downloading CDN libraries locally...');

const CDN_LIBRARIES = [
  // jQuery
  {
    url: 'https://code.jquery.com/jquery-1.10.1.min.js',
    filename: 'jquery-1.10.1.min.js',
  },
  // Lucide icons
  {
    url: 'https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js',
    filename: 'lucide.min.js',
  },
  // Crypto libraries
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
    filename: 'crypto-js.min.js',
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/js-sha1/0.7.0/sha1.min.js',
    filename: 'sha1.min.js',
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.11.0/sha256.min.js',
    filename: 'sha256.min.js',
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/js-sha3/0.9.3/sha3.min.js',
    filename: 'sha3.min.js',
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/js-sha512/0.9.0/sha512.min.js',
    filename: 'sha512.min.js',
  },
  // Highlight.js
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    filename: 'highlight-11.min.js',
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/highlight.min.js',
    filename: 'highlight-9.min.js',
  },
  // TinyColorPicker
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/tinyColorPicker/1.1.1/colors.min.js',
    filename: 'colors.min.js',
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/tinyColorPicker/1.1.1/jqColorPicker.min.js',
    filename: 'jqColorPicker.min.js',
  },
  // Core-js polyfill
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/core-js/3.33.1/minified.js',
    filename: 'core-js.min.js',
  },
  // SQL Formatter
  {
    url: 'https://cdn.jsdelivr.net/npm/sql-formatter@15.4.7/dist/sql-formatter.min.js',
    filename: 'sql-formatter.min.js',
  },
  // Crypto API
  {
    url: 'https://nf404.github.io/crypto-api/crypto-api.min.js',
    filename: 'crypto-api.min.js',
  },
  // Grapick (gradient picker)
  {
    url: 'https://artf.github.io/grapick/dist/grapick.min.js',
    filename: 'grapick.min.js',
  },
  // JSON Viewer
  {
    url: 'https://pfau-software.de/json-viewer/dist/iife/index.js',
    filename: 'json-viewer.min.js',
  },
  // Toast UI Editor
  {
    url: 'https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js',
    filename: 'toastui-editor-all.min.js',
  },
  {
    url: 'https://uicdn.toast.com/editor/latest/toastui-editor.min.css',
    filename: 'toastui-editor.min.css',
    isCSS: true,
  },
  {
    url: 'https://uicdn.toast.com/editor/latest/theme/toastui-editor-dark.min.css',
    filename: 'toastui-editor-dark.min.css',
    isCSS: true,
  },
];

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = [];

    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.on('data', (chunk) => file.push(chunk));
      response.on('end', () => {
        writeFileSync(destPath, Buffer.concat(file));
        resolve();
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

const cdnJsDir = join(OUTPUT_DIR, 'js', 'cdn');
const cdnCssDir = join(OUTPUT_DIR, 'css', 'cdn');
mkdirSync(cdnJsDir, { recursive: true });
mkdirSync(cdnCssDir, { recursive: true });

for (const lib of CDN_LIBRARIES) {
  const destDir = lib.isCSS ? cdnCssDir : cdnJsDir;
  const destPath = join(destDir, lib.filename);
  try {
    console.log(`   Downloading ${lib.filename}...`);
    await downloadFile(lib.url, destPath);
    console.log(`   ✓ Downloaded ${lib.filename}`);
  } catch (err) {
    console.error(`   ⚠️  Failed to download ${lib.filename}: ${err.message}`);
    // Continue with build - some libraries may be optional
  }
}

// Step 7: Fix HTML files for extension (CSP compliance + path fixes)
console.log('📋 Step 7: Fixing HTML files for extension (CSP compliance)...');

function getAllHtmlFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles(OUTPUT_DIR);
console.log(`   Found ${htmlFiles.length} HTML files to process...`);

const langCodes = ['en', 'vi', 'zh', 'hi', 'es', 'fr', 'pt', 'ja'];
const langPattern = langCodes.join('|');
let fixedCount = 0;
let inlineScriptCount = 0;

// Create directory for extracted inline scripts
const inlineScriptsDir = join(OUTPUT_DIR, 'js', 'inline');
mkdirSync(inlineScriptsDir, { recursive: true });

for (let i = 0; i < htmlFiles.length; i++) {
  const filePath = htmlFiles[i];

  // Progress log every 100 files
  if (i > 0 && i % 100 === 0) {
    console.log(`   Processed ${i}/${htmlFiles.length} files...`);
  }

  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Fix _astro references
    if (content.includes('/_astro/')) {
      content = content.replaceAll('/_astro/', '/astro/');
      modified = true;
    }

    // Replace CDN scripts with local versions
    const cdnReplacements = [
      // jQuery
      {
        pattern: /src=["']https:\/\/code\.jquery\.com\/jquery[^"']*\.min\.js["']/gi,
        replacement: 'src="/js/cdn/jquery-1.10.1.min.js"',
      },
      // Lucide
      {
        pattern: /src=["']https:\/\/unpkg\.com\/lucide@[^"']*["']/gi,
        replacement: 'src="/js/cdn/lucide.min.js"',
      },
    ];

    for (const cdn of cdnReplacements) {
      // Create new regex instance to avoid lastIndex issues
      const pattern = new RegExp(cdn.pattern.source, cdn.pattern.flags);
      if (pattern.test(content)) {
        const pattern2 = new RegExp(cdn.pattern.source, cdn.pattern.flags);
        content = content.replace(pattern2, cdn.replacement);
        modified = true;
      }
    }

    // Extract inline scripts to external files (Chrome Extension CSP requirement)
    // Match <script>...</script> but NOT <script src="..."> or <script type="application/...">
    const relPath = filePath.replace(OUTPUT_DIR, '').replace(/\\/g, '/').replace(/^\//, '');
    const fileHash = createHash('md5').update(relPath).digest('hex').substring(0, 8);
    let scriptIndex = 0;

    // Process inline scripts using a simpler, safer approach
    // First, find all script tags
    const scriptMatches = [];
    let lastIndex = 0;

    while (true) {
      const scriptStart = content.indexOf('<script', lastIndex);
      if (scriptStart === -1) break;

      // Check if it has src= attribute (skip external scripts)
      const tagEnd = content.indexOf('>', scriptStart);
      if (tagEnd === -1) break;

      const openTag = content.substring(scriptStart, tagEnd + 1);
      const hasSrc = /\bsrc\s*=/.test(openTag);
      const isAppType = /type\s*=\s*["']application\//.test(openTag);

      // Find closing tag
      const scriptEnd = content.indexOf('</script>', tagEnd);
      if (scriptEnd === -1) break;

      if (!hasSrc && !isAppType) {
        const scriptContent = content.substring(tagEnd + 1, scriptEnd);
        const fullMatch = content.substring(scriptStart, scriptEnd + 9);
        scriptMatches.push({
          start: scriptStart,
          end: scriptEnd + 9,
          content: scriptContent,
          fullMatch: fullMatch,
        });
      }

      lastIndex = scriptEnd + 9;
    }

    // Process matches in reverse order to preserve indices
    for (let j = scriptMatches.length - 1; j >= 0; j--) {
      const match = scriptMatches[j];
      const trimmedContent = match.content.trim();

      if (!trimmedContent) {
        // Remove empty scripts
        content = content.substring(0, match.start) + content.substring(match.end);
        modified = true;
        continue;
      }

      // Generate unique filename for this inline script
      const scriptFilename = `inline-${fileHash}-${scriptIndex++}.js`;
      const scriptPath = join(inlineScriptsDir, scriptFilename);

      // Write script content to file
      writeFileSync(scriptPath, trimmedContent, 'utf-8');
      inlineScriptCount++;

      // Replace inline script with external reference
      const replacement = `<script src="/js/inline/${scriptFilename}"></script>`;
      content = content.substring(0, match.start) + replacement + content.substring(match.end);
      modified = true;
    }

    // Fix internal links - add /app prefix and .html extension
    // Match href="/lang/path" where path doesn't already have extension
    const linkRegex = new RegExp(`href="/(${langPattern})/([^"#?]+)"`, 'g');
    const newContent = content.replace(linkRegex, (match, lang, pathPart) => {
      // Skip if is static asset (these stay at root level)
      if (
        pathPart.startsWith('css/') ||
        pathPart.startsWith('js/') ||
        pathPart.startsWith('images/') ||
        pathPart.startsWith('astro/') ||
        pathPart.endsWith('/')
      ) {
        return match;
      }
      // Add .html extension if not present, and add /app prefix
      if (/\.[a-zA-Z0-9]+$/.test(pathPart)) {
        return `href="/app/${lang}/${pathPart}"`;
      }
      return `href="/app/${lang}/${pathPart}.html"`;
    });

    if (newContent !== content) {
      content = newContent;
      modified = true;
    }

    // Fix root language links like href="/en" -> href="/app/en.html"
    const rootLangRegex = new RegExp(`href="/(${langPattern})"`, 'g');
    const finalContent = content.replace(rootLangRegex, 'href="/app/$1.html"');
    if (finalContent !== content) {
      content = finalContent;
      modified = true;
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      fixedCount++;
    }
  } catch (err) {
    console.error(`   Error processing ${filePath}: ${err.message}`);
  }
}

console.log(`   ✓ Fixed ${fixedCount} HTML files`);
console.log(`   ✓ Extracted ${inlineScriptCount} inline scripts to external files`);

// Step 8: Replace CDN URLs in all JS files (including extracted inline scripts)
console.log('📋 Step 8: Replacing CDN URLs in JS files...');

// CDN URL replacements for JS files
const jsCdnReplacements = [
  // jQuery
  {
    pattern: /["']https:\/\/code\.jquery\.com\/jquery[^"']*\.min\.js["']/g,
    replacement: '"/js/cdn/jquery-1.10.1.min.js"',
  },
  // Crypto-js
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/crypto-js\/[^"']*\/crypto-js\.min\.js["']/g,
    replacement: '"/js/cdn/crypto-js.min.js"',
  },
  // SHA libraries
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/js-sha1\/[^"']*\/sha1\.min\.js["']/g,
    replacement: '"/js/cdn/sha1.min.js"',
  },
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/js-sha256\/[^"']*\/sha256\.min\.js["']/g,
    replacement: '"/js/cdn/sha256.min.js"',
  },
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/js-sha3\/[^"']*\/sha3\.min\.js["']/g,
    replacement: '"/js/cdn/sha3.min.js"',
  },
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/js-sha512\/[^"']*\/sha512\.min\.js["']/g,
    replacement: '"/js/cdn/sha512.min.js"',
  },
  // Highlight.js
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/highlight\.js\/11\.[^"']*\/highlight\.min\.js["']/g,
    replacement: '"/js/cdn/highlight-11.min.js"',
  },
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/highlight\.js\/9\.[^"']*\/highlight\.min\.js["']/g,
    replacement: '"/js/cdn/highlight-9.min.js"',
  },
  // TinyColorPicker
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/tinyColorPicker\/[^"']*\/colors\.min\.js["']/g,
    replacement: '"/js/cdn/colors.min.js"',
  },
  {
    pattern:
      /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/tinyColorPicker\/[^"']*\/jqColorPicker\.min\.js["']/g,
    replacement: '"/js/cdn/jqColorPicker.min.js"',
  },
  // Core-js polyfill
  {
    pattern: /["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/core-js\/[^"']*\/minified\.js["']/g,
    replacement: '"/js/cdn/core-js.min.js"',
  },
  // Lucide
  {
    pattern: /["']https:\/\/unpkg\.com\/lucide@[^"']*["']/g,
    replacement: '"/js/cdn/lucide.min.js"',
  },
  // SQL Formatter
  {
    pattern:
      /["']https:\/\/cdn\.jsdelivr\.net\/npm\/sql-formatter@[^"']*\/dist\/sql-formatter\.min\.js["']/g,
    replacement: '"/js/cdn/sql-formatter.min.js"',
  },
  // Crypto API
  {
    pattern: /["']https:\/\/nf404\.github\.io\/crypto-api\/crypto-api\.min\.js["']/g,
    replacement: '"/js/cdn/crypto-api.min.js"',
  },
  // Grapick
  {
    pattern: /["']https:\/\/artf\.github\.io\/grapick\/dist\/grapick\.min\.js["']/g,
    replacement: '"/js/cdn/grapick.min.js"',
  },
  // JSON Viewer
  {
    pattern: /["']https:\/\/pfau-software\.de\/json-viewer\/dist\/iife\/index\.js["']/g,
    replacement: '"/js/cdn/json-viewer.min.js"',
  },
  // Toast UI Editor
  {
    pattern: /["']https:\/\/uicdn\.toast\.com\/editor\/latest\/toastui-editor-all\.min\.js["']/g,
    replacement: '"/js/cdn/toastui-editor-all.min.js"',
  },
  {
    pattern: /["']https:\/\/uicdn\.toast\.com\/editor\/latest\/toastui-editor\.min\.css["']/g,
    replacement: '"/css/cdn/toastui-editor.min.css"',
  },
  {
    pattern:
      /["']https:\/\/uicdn\.toast\.com\/editor\/latest\/theme\/toastui-editor-dark\.min\.css["']/g,
    replacement: '"/css/cdn/toastui-editor-dark.min.css"',
  },
];

function getAllJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Process JS files in multiple directories
const jsDirs = [join(OUTPUT_DIR, 'js'), join(OUTPUT_DIR, 'app', 'js'), join(OUTPUT_DIR, 'astro')];

let allJsFiles = [];
for (const jsDir of jsDirs) {
  if (existsSync(jsDir)) {
    allJsFiles = allJsFiles.concat(getAllJsFiles(jsDir));
  }
}

let jsFixedCount = 0;
for (const jsFilePath of allJsFiles) {
  try {
    let jsContent = readFileSync(jsFilePath, 'utf-8');
    const originalContent = jsContent;

    for (const repl of jsCdnReplacements) {
      // Create new regex instance to avoid lastIndex issues with global flag
      const pattern = new RegExp(repl.pattern.source, repl.pattern.flags);
      jsContent = jsContent.replace(pattern, repl.replacement);
    }

    if (jsContent !== originalContent) {
      writeFileSync(jsFilePath, jsContent, 'utf-8');
      jsFixedCount++;
    }
  } catch (err) {
    console.error(`   Error processing JS file ${jsFilePath}: ${err.message}`);
  }
}

console.log(`   ✓ Fixed CDN URLs in ${jsFixedCount} JS files`);

// Step 9: Calculate size
console.log('\n📊 Step 9: Calculating extension size...');
function getDirSize(dirPath) {
  let size = 0;
  const files = readdirSync(dirPath);
  for (const file of files) {
    const filePath = join(dirPath, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stat.size;
    }
  }
  return size;
}

const totalSize = getDirSize(OUTPUT_DIR);
const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`\n✅ Chrome Extension build complete!`);
console.log(`📁 Output: ${OUTPUT_DIR}`);
console.log(`📏 Total size: ${sizeMB} MB`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Add icons to chrome-extension/icons/ (16, 32, 48, 128 px)`);
console.log(`   2. Open chrome://extensions in Chrome`);
console.log(`   3. Enable "Developer mode"`);
console.log(`   4. Click "Load unpacked" and select: ${OUTPUT_DIR}`);
console.log(`\n🎉 Done!`);
