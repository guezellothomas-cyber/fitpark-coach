import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import type { SerieFaite } from './types';

/** Les séries faites sur un exercice lors d'une même séance. */
export interface PassageExercice {
  entrainementId: string;
  date: number;
  nomSeance: string;
  series: SerieFaite[];
}

/**
 * Historique d'un exercice, de la séance la plus récente à la plus ancienne.
 * Les séries d'échauffement sont exclues.
 */
export function useHistoriqueExercice(exerciceId: string, limite = 12): PassageExercice[] | undefined {
  return useLiveQuery(async () => {
    const entrainements = await db.entrainements
      .orderBy('debut')
      .reverse()
      .filter((e) => e.series.some((s) => s.exerciceId === exerciceId && !s.echauffement))
      .limit(limite)
      .toArray();
    return entrainements.map((e) => ({
      entrainementId: e.id,
      date: e.debut,
      nomSeance: e.nom,
      series: e.series.filter((s) => s.exerciceId === exerciceId && !s.echauffement),
    }));
  }, [exerciceId, limite]);
}
