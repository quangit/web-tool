import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://webtool.center',
  output: 'static',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          vi: 'vi',
          zh: 'zh',
          hi: 'hi',
          es: 'es',
          fr: 'fr',
          pt: 'pt',
          ja: 'ja',
        },
      },
    }),
  ],
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
