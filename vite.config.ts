import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// L'app est publiée sur GitHub Pages à l'adresse https://<utilisateur>.github.io/fitpark-coach/
// Si le dépôt GitHub porte un autre nom, définir BASE_PATH (ex. "/mon-depot/").
const base = process.env.BASE_PATH ?? '/fitpark-coach/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // "prompt" : une nouvelle version n'est jamais appliquée en pleine séance ;
      // l'app affiche un bandeau et c'est l'utilisateur qui décide de recharger.
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'FitPark Coach',
        short_name: 'FitPark',
        description: 'Carnet de musculation personnel, hors connexion.',
        lang: 'fr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0e0f0c',
        theme_color: '#0e0f0c',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Tout ce qui compose l'app est mis en cache au premier chargement :
        // ensuite, plus besoin de connexion.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,mp3,wav}'],
      },
    }),
  ],
});
