/**
 * La séance en cours en salle. Elle est enregistrée dans la base à chaque action :
 * si l'app est fermée ou le téléphone redémarre, on reprend exactement où on en était.
 */
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { nomSeance } from './seances';
import type { Entrainement, Seance, SerieFaite } from './types';

/** L'entraînement en cours (un seul à la fois), null s'il n'y en a pas. */
export function useEntrainementEnCours(): Entrainement | null | undefined {
  return useLiveQuery(async () => (await db.entrainements.filter((e) => e.fin === null).first()) ?? null, []);
}

export function useEntrainement(id: string): Entrainement | null | undefined {
  return useLiveQuery(async () => (await db.entrainements.get(id)) ?? null, [id]);
}

/** Lance une séance (ou reprend celle déjà en cours). Renvoie l'identifiant de l'entraînement. */
export async function demarrer(seance: Seance): Promise<string> {
  const enCours = await db.entrainements.filter((e) => e.fin === null).first();
  if (enCours) return enCours.id;
  const id = crypto.randomUUID();
  await db.entrainements.add({
    id,
    seanceId: seance.id,
    nom: nomSeance(seance),
    debut: Date.now(),
    fin: null,
    series: [],
    plan: seance.exercices,
    indexCourant: 0,
    finRepos: null,
    dureeRepos: 0,
  });
  return id;
}

async function modifier(id: string, f: (e: Entrainement) => Partial<Entrainement>): Promise<void> {
  await db.transaction('rw', db.entrainements, async () => {
    const e = await db.entrainements.get(id);
    if (e) await db.entrainements.update(id, f(e));
  });
}

/**
 * Enregistre une série. `repos` en secondes (0 = pas de repos) ; le chrono démarre aussitôt,
 * sous forme d'heure de fin.
 */
export function enregistrerSerie(id: string, serie: SerieFaite, indexSuivant: number, repos: number) {
  return modifier(id, (e) => ({
    series: [...e.series, serie],
    indexCourant: indexSuivant,
    finRepos: repos > 0 ? Date.now() + repos * 1000 : null,
    dureeRepos: repos,
  }));
}

/** Enregistre une série d'échauffement : elle ne change ni l'exercice affiché ni le repos. */
export function enregistrerEchauffement(id: string, serie: SerieFaite) {
  return modifier(id, (e) => ({ series: [...e.series, { ...serie, echauffement: true }] }));
}

/**
 * Remplace l'exercice à la position `index` (machine prise).
 * Avec `aussiSeance`, la séance type est modifiée aussi, pour les prochaines fois.
 */
export async function remplacerExercice(id: string, index: number, nouvelId: string, aussiSeance: boolean) {
  await db.transaction('rw', db.entrainements, db.seances, async () => {
    const e = await db.entrainements.get(id);
    const ancien = e?.plan?.[index];
    if (!e?.plan || !ancien) return;
    await db.entrainements.update(id, {
      plan: e.plan.map((p, i) => (i === index ? { ...p, exerciceId: nouvelId } : p)),
    });
    if (!aussiSeance || !e.seanceId) return;
    const seance = await db.seances.get(e.seanceId);
    if (!seance || seance.exercices.some((x) => x.exerciceId === nouvelId)) return;
    await db.seances.update(seance.id, {
      exercices: seance.exercices.map((x) => (x.exerciceId === ancien.exerciceId ? { ...x, exerciceId: nouvelId } : x)),
      modifieLe: Date.now(),
    });
  });
}

export function modifierSerie(id: string, position: number, serie: SerieFaite) {
  return modifier(id, (e) => ({ series: e.series.map((s, i) => (i === position ? serie : s)) }));
}

export function supprimerSerie(id: string, position: number) {
  return modifier(id, (e) => ({ series: e.series.filter((_, i) => i !== position) }));
}

export function allerA(id: string, index: number) {
  return modifier(id, () => ({ indexCourant: index }));
}

/** Ajoute ou retire du temps au repos en cours (en secondes, peut être négatif). */
export function ajusterRepos(id: string, secondes: number) {
  return modifier(id, (e) => {
    if (!e.finRepos) return {};
    const fin = Math.max(Date.now(), e.finRepos + secondes * 1000);
    return { finRepos: fin, dureeRepos: Math.max(1, (e.dureeRepos ?? 0) + secondes) };
  });
}

export function arreterRepos(id: string) {
  return modifier(id, () => ({ finRepos: null }));
}

export function terminer(id: string) {
  return modifier(id, () => ({ fin: Date.now(), finRepos: null }));
}

/** Abandonne la séance en cours : rien n'est gardé dans l'historique. */
export async function abandonner(id: string): Promise<void> {
  await db.entrainements.delete(id);
}

/**
 * Séries faites sur un exercice lors de la dernière séance terminée où il apparaît
 * (hors échauffement). Vide s'il n'a jamais été fait.
 */
export function useDerniereFois(exerciceId: string, saufEntrainement: string): SerieFaite[] | undefined {
  const resultat = useLiveQuery(async () => {
    const series = await chercherDerniereFois(exerciceId, saufEntrainement);
    return { exerciceId, series };
  }, [exerciceId, saufEntrainement]);
  // Pendant le changement d'exercice, l'ancien résultat ne doit pas être utilisé.
  return resultat?.exerciceId === exerciceId ? resultat.series : undefined;
}

async function chercherDerniereFois(exerciceId: string, saufEntrainement: string): Promise<SerieFaite[]> {
  const dernier = await db.entrainements
    .orderBy('debut')
    .reverse()
    .filter(
      (e) =>
        e.id !== saufEntrainement &&
        e.fin !== null &&
        e.series.some((s) => s.exerciceId === exerciceId && !s.echauffement),
    )
    .first();
  return dernier?.series.filter((s) => s.exerciceId === exerciceId && !s.echauffement) ?? [];
}

/** Toutes les séries des séances terminées avant `avant` (pour les records). */
export async function seriesAvant(avant: number): Promise<SerieFaite[]> {
  const anciens = await db.entrainements.where('debut').below(avant).toArray();
  return anciens.filter((e) => e.fin !== null).flatMap((e) => e.series);
}
