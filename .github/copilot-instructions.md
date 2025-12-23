# Copilot Instructions for Web Tools

## Project Overview
Privacy-focused web toolkit built with **Astro 4.x** – all cryptographic/encoding operations run client-side. No data leaves the browser.

## Architecture Quick Reference

### Directory Structure
- `src/components/` – Astro components with hierarchical base classes
- `src/pages/[lang]/` – Localized pages using dynamic routing (8 languages)
- `src/i18n/locales/` – Translation files (en.ts is the source of truth)
- `src/data/toolSections.ts` – Sidebar navigation and tool registry
- `public/js/` – Client-side JS libraries (**excluded from linting/prettier**)
- `public/css/` – Stylesheets

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
        <textarea class="container" id="input" spellcheck="false" placeholder={t('enter_here')}
          data-remember="input" data-share="input" data-auto-update></textarea>
      </BaseInputBlock>
      <BaseOutputBlock title={t('output')}>
        <textarea class="container" id="output" readonly placeholder={t('output_placeholder')}></textarea>
      </BaseOutputBlock>
    </div>
    <BaseSettingBlock title={t('settings')}>
      <div class="setting"><a class="btn" id="execute">{t('tool_name')}</a></div>
      <div class="setting">
        <label class="switcher"><input type="checkbox" id="auto-update" checked /><div class="toggle"></div>
          <span>{t('auto_update')}</span></label>
      </div>
      <div class="setting">
        <label class="switcher"><input type="checkbox" id="remember-input" /><div class="toggle"></div>
          <span>{t('remember_input')}</span></label>
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
4. Create JS logic in `public/js/` and set `window.method`

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
- **ESLint/Prettier ignore `public/js/`** – contains third-party and legacy code
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

### Adding a Language
1. Create locale file: `src/i18n/locales/{code}.ts`
2. Add to `languages` and `ui` exports in `src/i18n/ui.ts`
3. Add to `locales` array in `astro.config.mjs`
