import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',   // We handle registration manually in main.jsx
      filename: 'sw-v3.js',     // Unique filename forces all clients to update
      injectRegister: false,    // We call registerSW() ourselves in main.jsx

      manifest: {
        name: 'LoopGen',
        short_name: 'LoopGen',
        description: 'Buy and sell with ease',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1c7c45',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-192.png',          sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png',          sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      workbox: {
        // ── Critical: activate new SW immediately, don't wait ──────────────
        skipWaiting: true,    // New SW skips waiting state automatically
        clientsClaim: true,   // New SW claims all open tabs immediately

        // ── Listen for SKIP_WAITING message from main.jsx ──────────────────
        // (belt-and-suspenders: skipWaiting:true already handles this)

        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}'],

        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          // ── Navigation: NetworkFirst — always try to get fresh HTML ──────
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
            },
          },
          // ── Supabase API: NetworkOnly — never cache API responses ────────
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
          // ── Google Fonts: CacheFirst ──────────────────────────────────────
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
          // ── Images: CacheFirst ────────────────────────────────────────────
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 2592000 },
            },
          },
          // ── JS/CSS assets: StaleWhileRevalidate ───────────────────────────
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
        ],
      },

      devOptions: { enabled: false },
    }),
  ],

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: { supabase: ['@supabase/supabase-js'] },
      },
    },
  },

  server: { port: 5173, host: true },
});
