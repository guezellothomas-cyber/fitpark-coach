import { useEffect } from 'react';
import type { Theme } from '../db/types';

const COULEUR_BARRE = { sombre: '#0e0f0c', clair: '#f3f3ee' } as const;

/** Thème réellement affiché ("auto" suit le réglage clair/sombre de l'iPhone). */
function themeEffectif(theme: Theme): 'sombre' | 'clair' {
  if (theme !== 'auto') return theme;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'clair' : 'sombre';
}

/**
 * Applique le thème choisi à toute la page et le mémorise dans localStorage
 * pour qu'il soit appliqué dès l'ouverture suivante, avant même que React démarre.
 */
export function useAppliquerTheme(theme: Theme): void {
  useEffect(() => {
    const appliquer = () => {
      const effectif = themeEffectif(theme);
      document.documentElement.setAttribute('data-theme', effectif);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', COULEUR_BARRE[effectif]);
      try {
        localStorage.setItem('fitpark-theme', effectif);
      } catch {
        // Navigation privée : on se passe de la mémorisation.
      }
    };
    appliquer();

    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', appliquer);
    return () => mq.removeEventListener('change', appliquer);
  }, [theme]);
}
