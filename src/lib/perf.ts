import { formatNombre } from './format';

interface Serie {
  charge: number;
  reps: number;
}

/**
 * Résumé lisible d'une suite de séries.
 *   même charge partout      → "60 kg × 8, 8, 7"
 *   charges différentes      → "60 kg × 8 · 62,5 kg × 6, 5"
 *   poids du corps (0 kg)    → "12, 10, 9 reps"
 *   exercice en secondes     → "45, 40 s" (ou "10 kg × 45, 40 s")
 */
export function resumerSeries(series: readonly Serie[], secondes = false): string {
  if (series.length === 0) return '';
  const unite = secondes ? ' s' : '';
  if (series.every((s) => s.charge === 0)) {
    return `${series.map((s) => s.reps).join(', ')} ${secondes ? 's' : 'reps'}`;
  }

  // Regroupe les séries consécutives faites à la même charge.
  const groupes: { charge: number; reps: number[] }[] = [];
  for (const s of series) {
    const dernier = groupes.at(-1);
    if (dernier && dernier.charge === s.charge) dernier.reps.push(s.reps);
    else groupes.push({ charge: s.charge, reps: [s.reps] });
  }
  return groupes.map((g) => `${formatNombre(g.charge)} kg × ${g.reps.join(', ')}${unite}`).join(' · ');
}

/** "3 × 8-10", "3 × 10" ou "3 × 30-45 s". */
export function resumerObjectif(series: number, repsMin: number, repsMax: number, secondes = false): string {
  const reps = repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`;
  return `${series} × ${reps}${secondes ? ' s' : ''}`;
}
