import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://quangit.github.io',
  base: '/web-tool',
  output: 'static',
  build: {
    format: 'file'
  }
});
