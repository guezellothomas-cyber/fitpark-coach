import { formatNombre } from './format';

interface Serie {
  charge: number;
  reps: number;
}

/**
 * Résumé lisible d'une suite de séries.
 *   même charge partout      → "60 kg × 8, 8, 7"
 *   charges différentes      → "25 kg × 10, 27,5 kg × 8, 27,5 kg × 7"
 *   poids du corps (0 kg)    → "12, 10, 9 reps"
 *   exercice en secondes     → "45, 40 s" (ou "10 kg × 45, 40 s")
 */
export function resumerSeries(series: readonly Serie[], secondes = false): string {
  if (series.length === 0) return '';
  const unite = secondes ? ' s' : '';
  const premiere = series[0]!.charge;
  if (series.every((s) => s.charge === premiere)) {
    const reps = series.map((s) => s.reps).join(', ');
    return premiere === 0 ? `${reps} ${secondes ? 's' : 'reps'}` : `${formatNombre(premiere)} kg × ${reps}${unite}`;
  }
  return series.map((s) => `${formatNombre(s.charge)} kg × ${s.reps}${unite}`).join(', ');
}

/** "3 × 8-10", "3 × 10" ou "3 × 30-45 s". */
export function resumerObjectif(series: number, repsMin: number, repsMax: number, secondes = false): string {
  const reps = repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`;
  return `${series} × ${reps}${secondes ? ' s' : ''}`;
}
