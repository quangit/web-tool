# Copilot Instructions for Web Tools

## Project Overview

Privacy-focused web toolkit built with **Astro 4.x** – all cryptographic/encoding operations run client-side. No data leaves the browser.

## Architecture Quick Reference

### Directory Structure

- `src/components/` – Astro components with hierarchical base classes
- `src/pages/[lang]/` – Localized pages using dynamic routing (8 languages)
- `src/i18n/locales/` – Translation files (en.ts is the source of truth)
- `src/data/toolSections.ts` – Sidebar navigation and tool registry
- `src/scripts/` – **Project-owned JS/TS** (Astro-processed, optimized, bundled)
- `src/styles/` – **Project-owned CSS** (Astro-processed, optimized, minified)
- `public/js/` – **Third-party/legacy JS libraries** (excluded from linting/prettier, served as-is)
- `public/css/` – **Third-party/legacy CSS** (served as-is, not processed)

### Component Hierarchy

```
BaseLayout → BasePage → BaseInputBlock + BaseOutputBlock + BaseSettingBlock
           → HashPage/EncodingPage/CRCPage (specialized wrappers for common tools)
```

## Key Patterns

### Standard Page Structure (Reference: `src/pages/[lang]/syntax-highlight/index.astro`)

```astro
---
import BasePage from '../../../components/BasePage.astro';
import BaseInputBlock from '../../../components/BaseInputBlock.astro';
import BaseOutputBlock from '../../../components/BaseOutputBlock.astro';
import BaseSettingBlock from '../../../components/BaseSettingBlock.astro';
import { languages } from '../../../i18n/ui';
import { useTranslations } from '../../../i18n/utils';

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}

const { lang } = Astro.params;
const t = useTranslations(lang as any);
---

<BasePage title={t('tool.title')} description={t('tool.description')} activePage="category/tool">
  <div class="layout">
    <div class="layout-block">
      <BaseInputBlock title={t('input')}>
        <textarea
          class="container"
          id="input"
          spellcheck="false"
          placeholder={t('enter_here')}
          data-remember="input"
          data-share="input"
          data-auto-update></textarea>
      </BaseInputBlock>
      <BaseOutputBlock title={t('output')}>
        <textarea class="container" id="output" readonly placeholder={t('output_placeholder')}
        ></textarea>
      </BaseOutputBlock>
    </div>
    <BaseSettingBlock title={t('settings')}>
      <div class="setting"><a class="btn" id="execute">{t('tool_name')}</a></div>
      <div class="setting">
        <label class="switcher"
          ><input type="checkbox" id="auto-update" checked /><div class="toggle"></div>
          <span>{t('auto_update')}</span></label
        >
      </div>
      <div class="setting">
        <label class="switcher"
          ><input type="checkbox" id="remember-input" /><div class="toggle"></div>
          <span>{t('remember_input')}</span></label
        >
      </div>
      <!-- Tool-specific settings here -->
    </BaseSettingBlock>
  </div>
  <script is:inline>
    ++waitLoadCount;
    delayScripts.push({
      src: '/js/your-tool.js',
      onload: function () {
        window.method = yourProcessingFunction;
        methodLoad();
      },
    });
  </script>
</BasePage>
```

### Adding a New Tool Page

1. Create page in `src/pages/[lang]/<category>/<tool>.astro` (or `index.astro` for category root)
2. Add translations to ALL 8 locale files in `src/i18n/locales/`
3. Register in `src/data/toolSections.ts` with URL, name, and icon
4. Create JS logic:
   - **Project-owned code** → `src/scripts/` (Astro optimizes, bundles, tree-shakes)
   - **Third-party libraries** → `public/js/` or CDN (served as-is)

### i18n Pattern

- All user-facing text uses `t('key')` from `useTranslations()`
- Keys defined in `src/i18n/locales/en.ts`, mirrored in other locales
- Route format: `/{lang}/{category}/{tool}` (e.g., `/en/hash/sha256`)

### Client-Side Processing Pattern

- `main.js` orchestrates: input reading, auto-update, localStorage, share links
- Set `window.method = function(input) { return output; }` for processing
- Use `++waitLoadCount` + `methodLoad()` for async script loading
- Data attributes: `data-auto-update`, `data-remember`, `data-share`

### Specialized Components (for common tool types)

- `HashPage.astro` – Text hash with HMAC support
- `FileHashPage.astro` – File hash calculation
- `EncodingPage.astro` – Encode/decode tools
- `CRCPage.astro` – CRC checksum tools
- `InputFileBlock.astro` – File input with drag & drop (auto-loads file handling scripts)

### File Input Component (`InputFileBlock.astro`)

`InputFileBlock.astro` automatically loads these file handling scripts:

- `url-blob.js` – URL/Blob utilities
- `droppable-file.js` – Drag & drop file support
- `file.js` – File reading/processing

`InputBlock.astro` with `showFileUpload={true}` also auto-loads these scripts plus `file-loader.js`.

**⚠️ DO NOT duplicate these scripts in pages using `InputFileBlock` or `InputBlock` with `showFileUpload`:**

| Component                                 | Uses InputFileBlock/InputBlock | File scripts needed?                       |
| ----------------------------------------- | ------------------------------ | ------------------------------------------ |
| `EncodingPage` with `hasFileInput={true}` | ✅ Yes (InputFileBlock)        | ❌ No - auto-loaded                        |
| `BaseHashPage` with `isUseFile={true}`    | ✅ Yes (InputFileBlock)        | ❌ No - auto-loaded                        |
| `BaseFileHashPage`                        | ✅ Yes (via BaseHashPage)      | ❌ No - auto-loaded                        |
| `InputBlock` with `showFileUpload={true}` | ✅ Yes (internal)              | ❌ No - auto-loaded (incl. file-loader.js) |
| `BaseCryptoPage`                          | ✅ Yes (via InputBlock)        | ❌ No - auto-loaded (incl. file-loader.js) |
| Standalone pages with `<InputFileBlock>`  | ✅ Yes (direct)                | ❌ No - auto-loaded                        |
| `CRCPage`                                 | ❌ No (standalone HTML)        | ⚠️ Loaded internally via set:html          |
| Pages WITHOUT file components             | ❌ No                          | ✅ Yes - must load manually                |

```astro
<!-- ❌ WRONG - Duplicate scripts when using InputFileBlock -->
<EncodingPage hasFileInput={true}> ... </EncodingPage>
<script is:inline>
  ++waitLoadCount;
  delayScripts.push({
    src: '/js/url-blob.js',
    onload: function () {
      methodLoad();
    },
  });
  // These are already loaded by InputFileBlock!
</script>

<!-- ✅ CORRECT - Only load tool-specific scripts -->
<EncodingPage hasFileInput={true}> ... </EncodingPage>
<script is:inline>
  ++waitLoadCount;
  delayScripts.push({
    src: '/js/base64.min.js', // Tool-specific library only
    onload: function () {
      window.method = base64encode;
      methodLoad();
    },
  });
</script>
```

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Dev server at localhost:4321
pnpm run build        # Production build (runs astro check first)
pnpm run lint:fix     # Fix linting issues
pnpm run format       # Format code with Prettier
```

## Important Conventions

### Code Quality

- **`src/scripts/`** – Project-owned JS/TS, processed by Astro (linted, optimized)
- **`public/js/`** – Third-party/legacy code (ESLint/Prettier ignored, served as-is)
- TypeScript strict mode enabled for `src/`
- Astro components use TypeScript interfaces for Props

### Commit Format

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`

### Security

- No server-side data processing
- CSP headers defined in `public/_headers`
- All inputs validated client-side before processing

## Common Tasks

### Adding a Hash Algorithm

1. Add translation keys in `src/i18n/locales/*.ts`
2. Create text & file hash pages in `src/pages/[lang]/hash/`
3. Add entries to `toolSections.ts` under appropriate block
4. Include external library via CDN or `public/js/`

### Script Location Decision Guide

| Type                               | Location       | How to Load                                        |
| ---------------------------------- | -------------- | -------------------------------------------------- |
| **Project-owned code**             | `src/scripts/` | `<script src="../scripts/file.js">` or `import()`  |
| **Project-owned CSS**              | `src/styles/`  | `import '../styles/file.css';` in `<script>` block |
| **Small third-party libs (<50KB)** | `npm modules`  | `import Library from 'library-name'`               |
| **Scripts with CDN dependencies**  | `public/js/`   | `delayScripts` pattern with `is:inline`            |
| **Large third-party libs (>50KB)** | `public/js/`   | `<script is:inline src="/js/lib.js">`              |
| **Third-party CSS**                | `public/css/`  | `<link rel="stylesheet" href="/css/file.css">`     |
| **External CDN**                   | N/A            | `<script is:inline src="https://cdn...">`          |

> **Best Practice for Third-Party Libraries:**
>
> - **Small libraries (<50KB)**: Use npm modules (e.g., `clipboard`, `uuid`, `date-fns`) so Astro can bundle, optimize, and tree-shake them.
> - **Large libraries (>50KB)**: Keep in `public/js/` or use CDN to avoid bloating the bundle (e.g., `monaco-editor`, `pdf.js`).
> - **Highly specialized**: If only used on 1-2 pages, prefer CDN with lazy loading over bundling.

> **Note:** Scripts that depend on external CDN libraries (like Toast UI Editor) and use the `delayScripts` pattern should stay in `public/js/` because `is:inline` scripts are not processed by Astro's bundler.

> **CSS Note:** Project-owned CSS should be placed in `src/styles/` and imported via `import` statement. This allows Astro to optimize, minify, and bundle the CSS. Third-party CSS that needs to be served as-is should stay in `public/css/`.

### Common Pitfalls (Astro Inline Scripts)

⚠️ **CRITICAL: `define:vars` does NOT work with `is:inline` scripts**

```astro
<!-- ❌ WRONG - Variables will NOT be passed -->
<script is:inline define:vars={{ myVar }}>
  console.log(myVar); // ReferenceError: myVar is not defined
</script>

<!-- ✅ CORRECT - Hardcode values directly in is:inline scripts -->
<script is:inline>
  var myVar = 'https://cdn.example.com/lib.js';
</script>
```

⚠️ **`delayScripts` onload callbacks must wrap function calls**

```javascript
// ❌ WRONG - Will cause "methodLoad is not defined" error
delayScripts.push({
  src: 'https://cdn.example.com/lib.js',
  onload: methodLoad, // Direct reference fails
});

// ✅ CORRECT - Wrap in anonymous function
delayScripts.push({
  src: 'https://cdn.example.com/lib.js',
  onload: function () {
    methodLoad();
  },
});
```

⚠️ **`++waitLoadCount` must match number of external scripts**

```javascript
// ❌ WRONG - Mismatch causes loading issues
++waitLoadCount;
delayScripts.push(
  {
    src: 'lib1.js',
    onload: function () {
      methodLoad();
    },
  },
  {
    src: 'lib2.js',
    onload: function () {
      methodLoad();
    },
  }
);
++waitLoadCount; // Extra increment - WRONG!

// ✅ CORRECT - One increment per script
++waitLoadCount;
++waitLoadCount;
delayScripts.push(
  {
    src: 'lib1.js',
    onload: function () {
      methodLoad();
    },
  },
  {
    src: 'lib2.js',
    onload: function () {
      methodLoad();
    },
  }
);
```

⚠️ **Template literals with variables don't work in `is:inline` context**

```astro
---
const CDN_URL = 'https://cdn.example.com';
---

<!-- ❌ WRONG - Variable not available in is:inline -->
<link rel="stylesheet" href={`${CDN_URL}/style.css`} />
<!-- This works in template, but NOT inside is:inline scripts -->

<!-- ✅ CORRECT for is:inline - Hardcode the full URL -->
<link rel="stylesheet" href="https://cdn.example.com/style.css" />
```

### Adding a Language

1. Create locale file: `src/i18n/locales/{code}.ts`
2. Add to `languages` and `ui` exports in `src/i18n/ui.ts`
3. Add to `locales` array in `astro.config.mjs`
