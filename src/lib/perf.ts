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
 */
export function resumerSeries(series: readonly Serie[]): string {
  if (series.length === 0) return '';
  if (series.every((s) => s.charge === 0)) {
    return `${series.map((s) => s.reps).join(', ')} reps`;
  }

  // Regroupe les séries consécutives faites à la même charge.
  const groupes: { charge: number; reps: number[] }[] = [];
  for (const s of series) {
    const dernier = groupes.at(-1);
    if (dernier && dernier.charge === s.charge) dernier.reps.push(s.reps);
    else groupes.push({ charge: s.charge, reps: [s.reps] });
  }
  return groupes.map((g) => `${formatNombre(g.charge)} kg × ${g.reps.join(', ')}`).join(' · ');
}
