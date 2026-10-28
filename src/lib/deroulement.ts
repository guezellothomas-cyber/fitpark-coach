/**
 * Déroulement d'une séance : quel exercice vient ensuite, et faut-il se reposer ?
 *
 * Exercice seul : série, repos, série, repos… puis exercice suivant.
 * Superset (A lié à B) : série de A, puis directement B (sans repos), puis repos,
 * puis de nouveau A, etc.
 */
import type { ExerciceDeSeance, SerieFaite } from '../db/types';

/** Séries de travail (hors échauffement) déjà faites sur un exercice. */
export function seriesDe(series: readonly SerieFaite[], exerciceId: string): SerieFaite[] {
  return series.filter((s) => s.exerciceId === exerciceId && !s.echauffement);
}

/** Nombre de séries restantes pour l'exercice à la position `i` du plan. */
export function restantes(plan: readonly ExerciceDeSeance[], series: readonly SerieFaite[], i: number): number {
  const p = plan[i];
  return p ? Math.max(0, p.series - seriesDe(series, p.exerciceId).length) : 0;
}

/** Positions [début, fin] (incluses) du bloc superset qui contient l'exercice `i`. */
export function blocDe(plan: readonly ExerciceDeSeance[], i: number): [number, number] {
  let debut = i;
  while (debut > 0 && plan[debut - 1]?.supersetAvecSuivant) debut--;
  let fin = i;
  while (fin < plan.length - 1 && plan[fin]?.supersetAvecSuivant) fin++;
  return [debut, fin];
}

export interface Etape {
  /** Exercice à afficher ensuite, ou null si la séance est terminée. */
  index: number | null;
  /** Lancer le chrono de repos avant cet exercice ? */
  repos: boolean;
}

/**
 * Après avoir validé une série de l'exercice `i` (les séries passées incluent déjà celle-ci),
 * détermine l'étape suivante.
 */
export function etapeSuivante(plan: readonly ExerciceDeSeance[], series: readonly SerieFaite[], i: number): Etape {
  const reste = (j: number) => restantes(plan, series, j) > 0;
  const [debut, fin] = blocDe(plan, i);

  // Dans un superset : on passe au membre suivant du bloc sans repos.
  for (let j = i + 1; j <= fin; j++) if (reste(j)) return { index: j, repos: false };
  // Fin d'un tour de bloc (ou exercice seul) : repos, puis on reprend le bloc s'il reste des séries.
  for (let j = debut; j <= fin; j++) if (reste(j)) return { index: j, repos: true };
  // Bloc terminé : prochain exercice inachevé après le bloc, puis ceux sautés avant.
  for (let j = fin + 1; j < plan.length; j++) if (reste(j)) return { index: j, repos: true };
  for (let j = 0; j < debut; j++) if (reste(j)) return { index: j, repos: true };
  return { index: null, repos: false };
}

/** Le temps de repos à appliquer après une série de l'exercice `i` : celui du dernier du bloc. */
export function reposApres(plan: readonly ExerciceDeSeance[], i: number): number {
  const [, fin] = blocDe(plan, i);
  return plan[fin]?.repos ?? 90;
}
