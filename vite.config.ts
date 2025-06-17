import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // ¡Clave para registro automático!
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'ZoeMed',
        short_name: 'ZoeMed',
        description: 'Aplicación médica progresiva',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',  // ¡Ruta corregida! (con / al inicio)
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'  // Añadido para Android
          },
          {
            src: '/web-app-manifest-512x512.png',  // ¡Ruta corregida!
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{ts,js,css,html,ico,png,svg}']
      }
    })
  ],
  preview: {
    allowedHosts: ['2177-148-241-225-140.ngrok-free.app']
  }
});