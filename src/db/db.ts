import Dexie, { type EntityTable } from 'dexie';
import { migrerEntrainement, migrerSeance } from './migration';
import type { DispoSalle, Entrainement, Mesure, Reglages, Seance } from './types';

/**
 * Base de données locale (IndexedDB via la bibliothèque Dexie).
 * Chaque "table" est une liste d'objets ; la chaîne passée à stores() indique
 * la clé unique puis les champs sur lesquels on veut pouvoir chercher vite.
 */
class FitParkDB extends Dexie {
  reglages!: EntityTable<Reglages, 'id'>;
  salle!: EntityTable<DispoSalle, 'exerciceId'>;
  seances!: EntityTable<Seance, 'id'>;
  entrainements!: EntityTable<Entrainement, 'id'>;
  mesures!: EntityTable<Mesure, 'id'>;

  constructor() {
    super('fitpark-coach');
    const tables = {
      reglages: 'id',
      salle: 'exerciceId',
      seances: 'id, *jours',
      entrainements: 'id, debut, seanceId',
      mesures: 'id, date',
    };
    this.version(1).stores(tables);
    // Version 2 : une charge par série. La conversion se fait en une seule transaction
    // à la première ouverture : soit tout est converti, soit rien ne change.
    this.version(2)
      .stores(tables)
      .upgrade(async (tx) => {
        await tx.table('seances').toCollection().modify((s, ref) => {
          ref.value = migrerSeance(s);
        });
        await tx.table('entrainements').toCollection().modify((e, ref) => {
          ref.value = migrerEntrainement(e);
        });
      });
  }
}

export const db = new FitParkDB();

/** Noms de toutes les tables, utilisés par la sauvegarde / restauration. */
export const TABLES = ['reglages', 'salle', 'seances', 'entrainements', 'mesures'] as const;
export type NomTable = (typeof TABLES)[number];

/**
 * Demande au navigateur de ne pas effacer nos données quand l'espace manque.
 * Sur iPhone, une app ajoutée à l'écran d'accueil est déjà protégée ;
 * cette demande renforce la protection quand c'est possible.
 */
export async function demanderStockagePersistant(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}
