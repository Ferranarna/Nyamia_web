// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://nyamia.com',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } },
    }),
  ],
  build: {
    // External stylesheets only: keeps the CSP free of inline <style> hashes.
    inlineStylesheets: 'never',
  },
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline small scripts into the HTML (CSP script-src 'self').
      assetsInlineLimit: 0,
    },
    server: {
      proxy: { '/api': 'http://localhost:8020' },
    },
  },
})
