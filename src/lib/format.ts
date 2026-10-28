/** Formats d'affichage à la française. */

const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/** 2.5 → "2,5" ; 60 → "60". */
export function formatNombre(n: number): string {
  return nombre.format(n);
}

/** 90 → "1:30" ; 45 → "0:45". */
export function formatDuree(secondes: number): string {
  const s = Math.max(0, Math.round(secondes));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** "mercredi 28 octobre" */
export function formatJour(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

/** Jour de la semaine au format de l'app : 1 = lundi … 7 = dimanche. */
export function jourSemaine(date: Date): number {
  return date.getDay() === 0 ? 7 : date.getDay();
}
