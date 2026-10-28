import { useEffect, useState } from 'react';

/**
 * Heure actuelle, rafraîchie régulièrement tant que `actif` est vrai,
 * et immédiatement au retour de l'app au premier plan.
 */
export function useMaintenant(actif: boolean, intervalle = 250): number {
  const [maintenant, setMaintenant] = useState(Date.now);
  useEffect(() => {
    if (!actif) return;
    const maj = () => setMaintenant(Date.now());
    maj();
    const minuteur = window.setInterval(maj, intervalle);
    document.addEventListener('visibilitychange', maj);
    return () => {
      window.clearInterval(minuteur);
      document.removeEventListener('visibilitychange', maj);
    };
  }, [actif, intervalle]);
  return maintenant;
}

/**
 * Garde l'écran allumé pendant la séance (si l'iPhone le permet).
 * Le verrou saute quand l'app passe en arrière-plan : on le redemande au retour.
 */
export function useEcranAllume(actif: boolean): void {
  useEffect(() => {
    if (!actif || !('wakeLock' in navigator)) return;
    let verrou: WakeLockSentinel | null = null;
    const demander = () => {
      if (document.visibilityState !== 'visible') return;
      navigator.wakeLock
        .request('screen')
        .then((v) => (verrou = v))
        .catch(() => {});
    };
    demander();
    document.addEventListener('visibilitychange', demander);
    return () => {
      document.removeEventListener('visibilitychange', demander);
      void verrou?.release().catch(() => {});
    };
  }, [actif]);
}

/** Durée écoulée lisible : "42:05" ou "1:02:05". */
export function formatChrono(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}
