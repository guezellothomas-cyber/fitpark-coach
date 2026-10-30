/**
 * Conversion des anciennes données vers le modèle "une charge par série".
 * Ancien format : { series: 3, charge: 60, … } pour tout l'exercice.
 * Nouveau format : { prevues: [{ charge: 60, reps: 10 }, …], memeCharge: true, … }.
 * L'historique (les séries faites) avait déjà une charge par série : seules les séances types
 * et la copie du programme gardée dans chaque entraînement sont à convertir.
 * Ces fonctions acceptent l'ancien comme le nouveau format, et ne modifient pas leur entrée.
 */
import type { ExerciceDeSeance } from './types';

interface AncienExercice {
  exerciceId: string;
  series?: number;
  charge?: number;
  repsMin: number;
  repsMax: number;
  repos: number;
  supersetAvecSuivant: boolean;
}

export function migrerExercice(e: ExerciceDeSeance | AncienExercice): ExerciceDeSeance {
  if ('prevues' in e && Array.isArray(e.prevues)) return e;
  const { series, charge, ...reste } = e as AncienExercice;
  return {
    ...reste,
    prevues: Array.from({ length: Math.max(1, series ?? 1) }, () => ({ charge: charge ?? 0, reps: e.repsMax })),
    memeCharge: true,
  };
}

/** Séance type : convertit la liste de ses exercices. */
export function migrerSeance<T extends { exercices?: unknown }>(seance: T): T {
  if (!Array.isArray(seance.exercices)) return seance;
  return { ...seance, exercices: (seance.exercices as AncienExercice[]).map(migrerExercice) };
}

/** Entraînement : convertit sa copie du programme. Les séries faites restent telles quelles. */
export function migrerEntrainement<T extends { plan?: unknown }>(entrainement: T): T {
  if (!Array.isArray(entrainement.plan)) return entrainement;
  return { ...entrainement, plan: (entrainement.plan as AncienExercice[]).map(migrerExercice) };
}

/** Contenu d'une sauvegarde JSON, quel que soit son format. */
export function migrerDonnees<T extends { seances?: unknown[]; entrainements?: unknown[] }>(donnees: T): T {
  return {
    ...donnees,
    seances: (donnees.seances ?? []).map((s) => migrerSeance(s as { exercices?: unknown })),
    entrainements: (donnees.entrainements ?? []).map((e) => migrerEntrainement(e as { plan?: unknown })),
  };
}
