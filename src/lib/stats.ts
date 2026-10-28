/**
 * Statistiques de progression : semaine en cours, séries par muscle, équilibre poussée / tirage,
 * évolution et records par exercice.
 */
import { exerciceParId } from '../data/exercices';
import { MUSCLES, type MuscleId } from '../data/muscles';
import { REGIONS_DU_MUSCLE, type CarteRegions } from '../data/regions';
import type { Entrainement, SerieFaite } from '../db/types';
import { unRmEstime } from './records';

/** Lundi 0 h de la semaine qui contient `date`. */
export function debutSemaine(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const decalage = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - decalage);
  return d.getTime();
}

const travail = (series: readonly SerieFaite[]) => series.filter((s) => !s.echauffement);

/**
 * Séries par muscle : 1 série pour le muscle principal, 0,5 pour chaque muscle secondaire
 * (convention courante pour estimer le volume réel reçu par un muscle).
 */
export function seriesParMuscle(series: readonly SerieFaite[]): Record<MuscleId, number> {
  const total = Object.fromEntries(MUSCLES.map((m) => [m.id, 0])) as Record<MuscleId, number>;
  for (const s of travail(series)) {
    const e = exerciceParId(s.exerciceId);
    if (!e) continue;
    total[e.musclePrincipal] += 1;
    for (const m of e.musclesSecondaires) total[m] += 0.5;
  }
  return total;
}

/** Paliers de la carte du corps (séries par semaine). */
export const PALIERS = [
  { min: 10, intensite: 'fort', libelle: '10 séries et plus' },
  { min: 5, intensite: 'moyen', libelle: '5 à 9 séries' },
  { min: 0.5, intensite: 'leger', libelle: '1 à 4 séries' },
] as const;

/** Coloriage de la silhouette selon les séries de la semaine. */
export function carteSemaine(parMuscle: Record<MuscleId, number>): CarteRegions {
  const carte: CarteRegions = {};
  for (const m of MUSCLES) {
    const palier = PALIERS.find((p) => parMuscle[m.id] >= p.min);
    if (!palier) continue;
    for (const r of REGIONS_DU_MUSCLE[m.id]) carte[r] = palier.intensite;
  }
  return carte;
}

export interface Equilibre {
  poussee: number;
  tirage: number;
  /** null si l'équilibre est correct ou s'il y a trop peu de séries pour juger. */
  alerte: 'poussee' | 'tirage' | null;
}

/**
 * Équilibre poussée / tirage sur les séries de travail (sens du mouvement de l'exercice).
 * Alerte si un côté dépasse l'autre de plus de 50 %, à partir de 10 séries au total.
 */
export function equilibre(series: readonly SerieFaite[]): Equilibre {
  let poussee = 0;
  let tirage = 0;
  for (const s of travail(series)) {
    const sens = exerciceParId(s.exerciceId)?.mouvement.sens;
    if (sens === 'poussee') poussee++;
    else if (sens === 'tirage') tirage++;
  }
  let alerte: Equilibre['alerte'] = null;
  if (poussee + tirage >= 10) {
    if (poussee > tirage * 1.5) alerte = 'poussee';
    else if (tirage > poussee * 1.5) alerte = 'tirage';
  }
  return { poussee, tirage, alerte };
}

export interface PointProgression {
  date: number;
  chargeMax: number;
  volume: number;
  unRm: number;
  series: SerieFaite[];
}

/** Évolution d'un exercice, séance par séance (de la plus ancienne à la plus récente). */
export function progressionExercice(entrainements: readonly Entrainement[], exerciceId: string): PointProgression[] {
  return entrainements
    .map((e) => ({ date: e.debut, series: travail(e.series).filter((s) => s.exerciceId === exerciceId) }))
    .filter((p) => p.series.length > 0)
    .sort((a, b) => a.date - b.date)
    .map((p) => ({
      date: p.date,
      series: p.series,
      chargeMax: Math.max(...p.series.map((s) => s.charge)),
      volume: p.series.reduce((t, s) => t + s.charge * s.reps, 0),
      unRm: Math.max(...p.series.map((s) => unRmEstime(s.charge, s.reps))),
    }));
}

export interface RecordExercice {
  exerciceId: string;
  /** Série la plus lourde (à charge égale, celle avec le plus de reps). */
  meilleure: { charge: number; reps: number; date: number };
  unRm: number;
  nbSeances: number;
  derniere: number;
}

/** Records de chaque exercice déjà pratiqué, du plus récemment fait au plus ancien. */
export function recordsParExercice(entrainements: readonly Entrainement[]): RecordExercice[] {
  const parId = new Map<string, RecordExercice>();
  for (const e of entrainements) {
    const vus = new Set<string>();
    for (const s of travail(e.series)) {
      let r = parId.get(s.exerciceId);
      if (!r) {
        r = { exerciceId: s.exerciceId, meilleure: { charge: s.charge, reps: s.reps, date: e.debut }, unRm: 0, nbSeances: 0, derniere: 0 };
        parId.set(s.exerciceId, r);
      }
      const m = r.meilleure;
      if (s.charge > m.charge || (s.charge === m.charge && s.reps > m.reps)) {
        r.meilleure = { charge: s.charge, reps: s.reps, date: e.debut };
      }
      r.unRm = Math.max(r.unRm, unRmEstime(s.charge, s.reps));
      r.derniere = Math.max(r.derniere, e.debut);
      if (!vus.has(s.exerciceId)) {
        vus.add(s.exerciceId);
        r.nbSeances++;
      }
    }
  }
  return [...parId.values()].sort((a, b) => b.derniere - a.derniere);
}
