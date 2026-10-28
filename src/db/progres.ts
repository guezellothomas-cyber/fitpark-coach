import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import type { Entrainement, Mesure } from './types';

/** Toutes les séances terminées, de la plus récente à la plus ancienne. */
export function useEntrainementsTermines(): Entrainement[] | undefined {
  return useLiveQuery(async () => {
    const tous = await db.entrainements.orderBy('debut').reverse().toArray();
    return tous.filter((e) => e.fin !== null);
  }, []);
}

/** Mesures (poids, mensurations), de la plus ancienne à la plus récente. */
export function useMesures(): Mesure[] | undefined {
  return useLiveQuery(() => db.mesures.orderBy('date').toArray(), []);
}

/** Date du jour au format AAAA-MM-JJ (heure locale). */
export function aujourdhuiISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Enregistre une mesure ; s'il en existe déjà une ce jour-là, elle est remplacée. */
export async function enregistrerMesure(mesure: Omit<Mesure, 'id'>): Promise<void> {
  await db.transaction('rw', db.mesures, async () => {
    const existante = await db.mesures.where('date').equals(mesure.date).first();
    await db.mesures.put({ ...mesure, id: existante?.id ?? crypto.randomUUID() });
  });
}

export async function supprimerMesure(id: string): Promise<void> {
  await db.mesures.delete(id);
}
