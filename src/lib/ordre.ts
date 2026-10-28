/**
 * Ordre conseillé des exercices dans une séance :
 *   1. muscle principal de la séance avant les muscles secondaires (ordre de sélection des muscles,
 *      ex. pecs avant triceps) ;
 *   2. polyarticulaires avant isolations ;
 *   3. parmi eux, les plus lourds d'abord : libre, puis machines, puis poulies.
 * Les supersets restent soudés : un bloc lié se déplace d'un seul tenant.
 */
import { exerciceParId } from '../data/exercices';
import type { MuscleId } from '../data/muscles';
import type { TypeExercice } from '../data/types';
import type { ExerciceDeSeance } from '../db/types';

const LOURDEUR: Record<TypeExercice, number> = {
  libre: 0,
  'machine-disques': 1,
  'poids-du-corps': 2,
  'machine-guidee': 3,
  poulie: 4,
};

/** Clé de tri d'un exercice : plus elle est petite, plus il passe tôt. */
function cle(exerciceId: string, muscles: readonly MuscleId[]): number[] {
  const e = exerciceParId(exerciceId);
  if (!e) return [99, 9, 9];
  const rang = muscles.indexOf(e.musclePrincipal);
  return [
    rang === -1 ? 98 : rang,
    e.mouvement.articulation === 'polyarticulaire' ? 0 : 1,
    LOURDEUR[e.type],
  ];
}

function comparerCles(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i]! - b[i]!;
  return 0;
}

/** Découpe la liste en blocs : un exercice seul, ou plusieurs exercices liés en superset. */
function blocs(exercices: readonly ExerciceDeSeance[]): ExerciceDeSeance[][] {
  const resultat: ExerciceDeSeance[][] = [];
  let courant: ExerciceDeSeance[] = [];
  for (const e of exercices) {
    courant.push(e);
    if (!e.supersetAvecSuivant) {
      resultat.push(courant);
      courant = [];
    }
  }
  if (courant.length) resultat.push(courant);
  return resultat;
}

/** Remet toute la séance dans l'ordre conseillé (tri stable, supersets conservés). */
export function ordonner(exercices: readonly ExerciceDeSeance[], muscles: readonly MuscleId[]): ExerciceDeSeance[] {
  return blocs(exercices)
    .map((b, i) => ({ b, i, k: cle(b[0]!.exerciceId, muscles) }))
    .sort((x, y) => comparerCles(x.k, y.k) || x.i - y.i)
    .flatMap((x) => x.b);
}

/**
 * Insère un nouvel exercice à sa place conseillée, sans bouger les autres :
 * juste après le dernier exercice qui doit passer avant lui, et jamais au milieu d'un superset.
 */
export function inserer(
  exercices: readonly ExerciceDeSeance[],
  nouveau: ExerciceDeSeance,
  muscles: readonly MuscleId[],
): ExerciceDeSeance[] {
  const k = cle(nouveau.exerciceId, muscles);
  let position = 0;
  exercices.forEach((e, i) => {
    if (comparerCles(cle(e.exerciceId, muscles), k) <= 0) position = i + 1;
  });
  while (position > 0 && position < exercices.length && exercices[position - 1]!.supersetAvecSuivant) position++;
  // Si le précédent est le dernier d'une liste liée en superset, la liaison s'arrête là.
  const copie = [...exercices];
  copie.splice(position, 0, { ...nouveau, supersetAvecSuivant: false });
  if (position > 0 && position === exercices.length && copie[position - 1]!.supersetAvecSuivant) {
    copie[position - 1] = { ...copie[position - 1]!, supersetAvecSuivant: false };
  }
  return copie;
}
