import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import type { Reglages } from './types';

export const REGLAGES_DEFAUT: Reglages = {
  id: 'app',
  theme: 'sombre',
  son: true,
  pasCharge: 2.5,
  reposParDefaut: 90,
  minuteurIphone: false,
};

/** Lit les réglages et se met à jour tout seul quand ils changent. */
export function useReglages(): Reglages {
  const enregistres = useLiveQuery(() => db.reglages.get('app'), []);
  return { ...REGLAGES_DEFAUT, ...enregistres };
}

/** Modifie un ou plusieurs réglages. */
export async function majReglages(modif: Partial<Omit<Reglages, 'id'>>): Promise<void> {
  await db.transaction('rw', db.reglages, async () => {
    const actuels = (await db.reglages.get('app')) ?? REGLAGES_DEFAUT;
    await db.reglages.put({ ...actuels, ...modif, id: 'app' });
  });
}
