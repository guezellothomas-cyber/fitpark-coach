import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { EXERCICES } from '../data/exercices';
import type { Exercice } from '../data/types';
import { db } from './db';

/**
 * Catalogue complet, complété par mon réglage "disponible dans ma salle".
 * Par défaut tout est disponible : seuls les exercices décochés sont enregistrés.
 * Renvoie undefined pendant le tout premier chargement.
 */
export function useExercices(): Exercice[] | undefined {
  const dispos = useLiveQuery(() => db.salle.toArray(), []);
  return useMemo(() => {
    if (!dispos) return undefined;
    const absents = new Set(dispos.filter((d) => !d.disponible).map((d) => d.exerciceId));
    return EXERCICES.map((e) => ({ ...e, disponibleDansMaSalle: !absents.has(e.id) }));
  }, [dispos]);
}

/** Coche ou décoche un exercice comme présent dans ma salle. */
export async function definirDisponible(exerciceId: string, disponible: boolean): Promise<void> {
  if (disponible) await db.salle.delete(exerciceId);
  else await db.salle.put({ exerciceId, disponible: false });
}
