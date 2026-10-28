import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Génère toutes les icônes PNG (écran d'accueil iPhone, manifest) à partir de public/icon.svg.
// Commande : npm run icones
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // Fond graphite plein sur les icônes "maskable" et Apple (iOS n'aime pas la transparence).
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#0e0f0c' } },
    // Pas de marge : le dessin a déjà son propre fond, l'iPhone arrondit lui-même les coins.
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#0e0f0c' } },
  },
  images: ['public/icon.svg'],
});
