import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Capacitor requires base '/' for native assets resolution
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split Supabase client into its own chunk (saves main bundle size)
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
