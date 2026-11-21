/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://zchumager.github.io/resistor-calculator/
  base: '/resistor-calculator/',
  plugins: [
    react(),
    VitePWA({
      // The app asks before reloading into a new version (see UpdatePrompt).
      registerType: 'prompt',
      // Icons are generated from public/icon.svg (pwa-assets.config.ts) and linked in <head>.
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        id: '/resistor-calculator/',
        name: 'Resistor Calculator',
        short_name: 'Resistors',
        description: "Find a resistor's value from its color bands.",
        lang: 'en',
        display: 'standalone',
        theme_color: '#1f3a68',
        background_color: '#f4f6f8',
        categories: ['utilities', 'education'],
      },
      workbox: {
        // Precache everything the app needs, so it works offline. Don't add `webmanifest`: the
        // plugin precaches the manifest itself, and a second entry with another revision makes
        // Workbox throw, leaving a service worker that caches nothing (scripts/check-sw.mjs).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
