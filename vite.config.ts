import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// The production origin is the placeholder https://wortense.vercel.app
// (documented in README; the real domain is only needed for absolute OG URLs).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icon.svg',
        'apple-touch-icon.png',
        'og-image.png',
      ],
      manifest: {
        name: 'Wortense',
        short_name: 'Wortense',
        description:
          'Learn the shades of meaning of English near-synonyms by ordering them from mildest to most intense.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#faf7f2',
        background_color: '#faf7f2',
        // These PNG icons are produced by npm run icons (this phase); the
        // manifest references them ahead of time so no code change is needed.
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})