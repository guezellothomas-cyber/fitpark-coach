import { useLiveQuery } from 'dexie-react-hooks';
import { exerciceParId } from '../data/exercices';
import { libelleMuscle } from '../data/muscles';
import { inserer } from '../lib/ordre';
import { db } from './db';
import type { ExerciceDeSeance, Reglages, Seance } from './types';

/** Toutes les séances, triées par premier jour de la semaine puis par nom. */
export function useSeances(): Seance[] | undefined {
  return useLiveQuery(async () => {
    const seances = await db.seances.toArray();
    const premierJour = (s: Seance) => (s.jours.length ? Math.min(...s.jours) : 8);
    return seances.sort((a, b) => premierJour(a) - premierJour(b) || a.creeLe - b.creeLe);
  }, []);
}

/** Une séance ; null si elle n'existe pas, undefined pendant le chargement. */
export function useSeance(id: string): Seance | null | undefined {
  return useLiveQuery(async () => (await db.seances.get(id)) ?? null, [id]);
}

/** Nom affiché : le nom saisi, sinon les muscles ciblés ("Pectoraux / Triceps"). */
export function nomSeance(s: Pick<Seance, 'nom' | 'muscles'>): string {
  if (s.nom.trim()) return s.nom.trim();
  if (s.muscles.length) return s.muscles.map(libelleMuscle).join(' / ');
  return 'Nouvelle séance';
}

export async function creerSeance(): Promise<string> {
  const id = crypto.randomUUID();
  const maintenant = Date.now();
  await db.seances.add({ id, nom: '', jours: [], muscles: [], exercices: [], creeLe: maintenant, modifieLe: maintenant });
  return id;
}

export async function majSeance(id: string, modif: Partial<Omit<Seance, 'id' | 'creeLe'>>): Promise<void> {
  await db.seances.update(id, { ...modif, modifieLe: Date.now() });
}

export async function supprimerSeance(id: string): Promise<void> {
  await db.seances.delete(id);
}

/** Charge la plus lourde de la dernière séance faite sur cet exercice (0 si jamais fait). */
async function derniereCharge(exerciceId: string): Promise<number> {
  const dernier = await db.entrainements
    .orderBy('debut')
    .reverse()
    .filter((e) => e.series.some((s) => s.exerciceId === exerciceId && !s.echauffement))
    .first();
  const series = dernier?.series.filter((s) => s.exerciceId === exerciceId && !s.echauffement) ?? [];
  return series.reduce((max, s) => Math.max(max, s.charge), 0);
}

/**
 * Enregistre un programme généré : une séance par jour choisi (dans l'ordre de la semaine).
 * Avec `remplacer`, les séances existantes sont supprimées d'abord (l'historique est conservé).
 * La charge de départ de chaque exercice reprend la dernière charge utilisée, s'il y en a une.
 */
export async function creerProgramme(
  seances: readonly { nom: string; muscles: Seance['muscles']; exercices: ExerciceDeSeance[] }[],
  jours: readonly number[],
  remplacer: boolean,
): Promise<void> {
  const tries = [...jours].sort((a, b) => a - b);
  const maintenant = Date.now();
  const completes: Seance[] = [];
  for (const [i, s] of seances.entries()) {
    const exercices: ExerciceDeSeance[] = [];
    for (const e of s.exercices) exercices.push({ ...e, charge: await derniereCharge(e.exerciceId) });
    completes.push({
      id: crypto.randomUUID(),
      nom: s.nom,
      jours: tries[i] !== undefined ? [tries[i]!] : [],
      muscles: s.muscles,
      exercices,
      creeLe: maintenant + i,
      modifieLe: maintenant,
    });
  }
  await db.transaction('rw', db.seances, async () => {
    if (remplacer) await db.seances.clear();
    await db.seances.bulkAdd(completes);
  });
}

/**
 * Ajoute un exercice à la séance, à sa place conseillée, avec des réglages par défaut :
 * polyarticulaire 3 × 8-10, isolation 3 × 10-12, repos par défaut des Réglages,
 * charge de départ = dernière charge utilisée sur cet exercice.
 */
export async function ajouterExercice(seance: Seance, exerciceId: string, reglages: Reglages): Promise<void> {
  const e = exerciceParId(exerciceId);
  const poly = e?.mouvement.articulation === 'polyarticulaire';
  const secondes = e?.mesure === 'secondes';
  const nouveau: ExerciceDeSeance = {
    exerciceId,
    series: 3,
    repsMin: secondes ? 30 : poly ? 8 : 10,
    repsMax: secondes ? 45 : poly ? 10 : 12,
    charge: await derniereCharge(exerciceId),
    repos: reglages.reposParDefaut,
    supersetAvecSuivant: false,
  };
  await majSeance(seance.id, { exercices: inserer(seance.exercices, nouveau, seance.muscles) });
}
