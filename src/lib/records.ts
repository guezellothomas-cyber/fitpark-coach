/**
 * Records et 1RM estimé.
 * 1RM = charge maximale qu'on pourrait soulever une seule fois. Il est ESTIMÉ avec la formule
 * d'Epley : 1RM ≈ charge × (1 + reps / 30). C'est une approximation, moins fiable au-delà de 10 reps.
 */
import type { SerieFaite } from '../db/types';

export function unRmEstime(charge: number, reps: number): number {
  if (charge <= 0 || reps <= 0) return 0;
  if (reps === 1) return charge;
  return Math.round(charge * (1 + reps / 30) * 10) / 10;
}

/** Volume = somme des charges × répétitions (séries de travail uniquement). */
export function volume(series: readonly SerieFaite[]): number {
  return series.filter((s) => !s.echauffement).reduce((t, s) => t + s.charge * s.reps, 0);
}

export interface Record {
  exerciceId: string;
  type: 'charge' | '1rm';
  valeur: number;
  /** Ancien record (0 si c'est la première fois). */
  ancien: number;
}

function meilleurs(series: readonly SerieFaite[]) {
  const parExercice = new Map<string, { charge: number; unRm: number }>();
  for (const s of series) {
    if (s.echauffement || s.charge <= 0) continue;
    const m = parExercice.get(s.exerciceId) ?? { charge: 0, unRm: 0 };
    m.charge = Math.max(m.charge, s.charge);
    m.unRm = Math.max(m.unRm, unRmEstime(s.charge, s.reps));
    parExercice.set(s.exerciceId, m);
  }
  return parExercice;
}

/**
 * Records battus pendant une séance par rapport à tout l'historique précédent.
 * Un exercice jamais fait auparavant ne compte pas comme record (il n'y a rien à battre).
 */
export function recordsBattus(seance: readonly SerieFaite[], avant: readonly SerieFaite[]): Record[] {
  const anciens = meilleurs(avant);
  const records: Record[] = [];
  for (const [exerciceId, m] of meilleurs(seance)) {
    const a = anciens.get(exerciceId);
    if (!a) continue;
    if (m.charge > a.charge) records.push({ exerciceId, type: 'charge', valeur: m.charge, ancien: a.charge });
    else if (m.unRm > a.unRm) records.push({ exerciceId, type: '1rm', valeur: m.unRm, ancien: a.unRm });
  }
  return records;
}
