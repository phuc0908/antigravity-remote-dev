import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: {
        name: 'Antigravity Remote',
        short_name: 'AG Remote',
        description: 'Remote monitor for Antigravity IDE',
        theme_color: '#0b1020',
        background_color: '#0b1020',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/cascades/,
          /^\/snapshot/,
          /^\/styles/,
          /^\/send/,
          /^\/click/,
          /^\/scroll/,
          /^\/popup/,
          /^\/css/,
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5100,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:3563',
      '/cascades': 'http://localhost:3563',
      '/snapshot': 'http://localhost:3563',
      '/styles': 'http://localhost:3563',
      '/send': 'http://localhost:3563',
      '/click': 'http://localhost:3563',
      '/scroll': 'http://localhost:3563',
      '/popup': 'http://localhost:3563',
      '/popup-click': 'http://localhost:3563',
      '/dismiss': 'http://localhost:3563',
      '/new-conversation': 'http://localhost:3563',
      '/css': 'http://localhost:3563',
    },
  },
  build: {
    outDir: 'dist',
  },
});
