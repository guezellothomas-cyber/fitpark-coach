import { db, TABLES, type NomTable } from './db';

/**
 * Sauvegarde complète des données dans un seul fichier JSON,
 * pour pouvoir tout restaurer si Safari est vidé ou si je change de téléphone.
 */
export interface Sauvegarde {
  app: 'fitpark-coach';
  format: 1;
  exporteLe: string;
  donnees: Record<NomTable, unknown[]>;
}

/** Rassemble le contenu de toutes les tables. */
export async function creerSauvegarde(): Promise<Sauvegarde> {
  const donnees = {} as Record<NomTable, unknown[]>;
  await db.transaction('r', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) donnees[t] = await db.table(t).toArray();
  });
  return { app: 'fitpark-coach', format: 1, exporteLe: new Date().toISOString(), donnees };
}

/**
 * Propose d'enregistrer le fichier de sauvegarde.
 * Sur iPhone, la feuille de partage s'ouvre : choisir "Enregistrer dans Fichiers".
 * Sur ordinateur, le fichier est simplement téléchargé.
 * Renvoie false si l'utilisateur a annulé.
 */
export async function exporterSauvegarde(): Promise<boolean> {
  const sauvegarde = await creerSauvegarde();
  const date = sauvegarde.exporteLe.slice(0, 10);
  const nom = `fitpark-sauvegarde-${date}.json`;
  const fichier = new File([JSON.stringify(sauvegarde, null, 2)], nom, {
    type: 'application/json',
  });

  if (navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], title: 'Sauvegarde FitPark Coach' });
      return true;
    } catch (e) {
      // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur.
      if (e instanceof DOMException && e.name === 'AbortError') return false;
      throw e;
    }
  }

  const url = URL.createObjectURL(fichier);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  lien.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/** Vérifie qu'un objet lu dans un fichier a bien la forme d'une sauvegarde FitPark. */
function estSauvegarde(x: unknown): x is Sauvegarde {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Partial<Sauvegarde>;
  if (s.app !== 'fitpark-coach' || s.format !== 1) return false;
  if (typeof s.donnees !== 'object' || s.donnees === null) return false;
  return TABLES.every((t) => Array.isArray(s.donnees?.[t] ?? []));
}

/** Lit un fichier choisi par l'utilisateur et vérifie son contenu, sans rien modifier. */
export async function lireSauvegarde(fichier: File): Promise<Sauvegarde> {
  let contenu: unknown;
  try {
    contenu = JSON.parse(await fichier.text());
  } catch {
    throw new Error("Ce fichier n'est pas un fichier JSON lisible.");
  }
  if (!estSauvegarde(contenu)) {
    throw new Error("Ce fichier n'est pas une sauvegarde FitPark Coach.");
  }
  return contenu;
}

/** Remplace toutes les données actuelles par celles de la sauvegarde (tout ou rien). */
export async function restaurerSauvegarde(sauvegarde: Sauvegarde): Promise<void> {
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear();
      await db.table(t).bulkPut(sauvegarde.donnees[t] ?? []);
    }
  });
}

/** Petit résumé lisible du contenu d'une sauvegarde, affiché avant de la restaurer. */
export function resumerSauvegarde(s: Sauvegarde): string {
  const n = (t: NomTable) => s.donnees[t]?.length ?? 0;
  const date = new Date(s.exporteLe).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `Sauvegarde du ${date} : ${n('seances')} séance(s) type, ${n('entrainements')} entraînement(s), ${n('mesures')} mesure(s).`;
}
