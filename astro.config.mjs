import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://webtool.center',
  output: 'static',
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi', 'zh', 'hi', 'es', 'fr', 'pt', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  compressHTML: true,
});
