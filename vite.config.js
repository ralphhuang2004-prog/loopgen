import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      filename: 'sw-v4.js',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'loopgen-logo.png', 'icons/*.png'],
      manifest: {
        name: 'LoopGen',
        short_name: 'LoopGen',
        description: 'A marketplace for unique finds',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1c7c45',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // skipWaiting + clients.claim = new SW activates immediately
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // Supabase API — always NetworkFirst, never cache
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
            options: { cacheName: 'supabase-nocache' },
          },
          // App pages — NetworkFirst (fresh content, fallback to cache)
          {
            urlPattern: /^\/$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 5,
            },
          },
          // Static assets — CacheFirst (images, fonts)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 150, maxAgeSeconds: 2592000 },
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
