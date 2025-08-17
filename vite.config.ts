import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  },
    },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        start_url: '/',
        scope: '/',
        name: 'agendamedmx',
        short_name: 'agendamedmx',
        description: 'Aplicación médica progresiva',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { "src": "/web-app-manifest-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
          { "src": "/web-app-manifest-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
          { "src": "/web-app-manifest-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
          { "src": "/web-app-manifest-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
        ]},
      workbox: {
        maximumFileSizeToCacheInBytes: 80 * 1024 * 1024, // 80 MB

        globPatterns: ['**/*.{ts,js,css,html,ico,png,svg,wasm,json}'],
        navigateFallbackDenylist: [/^\/models\//],

        runtimeCaching: [
          // Archivos del modelo (pesos/tokenizer) desde Hugging Face
          {
        urlPattern: /\/models\/.*\.(onnx|json|bin)$/i,
        handler: 'CacheFirst',
        options: { cacheName: 'local-model', cacheableResponse: { statuses: [0, 200] } }

          },
          // Assets de transformers.js si los trae vía unpkg/jsdelivr (por si acaso)
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  preview: {
  headers: {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
  },
  allowedHosts: [".ngrok-free.app"],
  },
});
