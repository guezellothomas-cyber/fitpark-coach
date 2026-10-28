/**
 * Remplacement d'un exercice quand la machine est prise :
 * on cherche un équivalent pour le même muscle et la même zone, disponible dans ma salle.
 * Ordre de préférence : même zone, même type de mouvement (poly / isolation),
 * même position de charge, puis les exercices de référence.
 * S'il n'existe aucun équivalent sur la même zone, on propose le même muscle.
 */
import type { ExerciceCatalogue } from '../data/types';

type Candidat = ExerciceCatalogue & { disponibleDansMaSalle?: boolean };

export interface Equivalent {
  exercice: ExerciceCatalogue;
  memeZone: boolean;
}

export function equivalents(
  depart: ExerciceCatalogue,
  catalogue: readonly Candidat[],
  exclus: ReadonlySet<string> = new Set(),
  limite = 6,
): Equivalent[] {
  const candidats = catalogue.filter(
    (c) =>
      c.id !== depart.id &&
      !exclus.has(c.id) &&
      c.disponibleDansMaSalle !== false &&
      c.musclePrincipal === depart.musclePrincipal,
  );
  const cle = (c: ExerciceCatalogue) => [
    c.zone === depart.zone,
    c.mouvement.articulation === depart.mouvement.articulation,
    c.positionCharge === depart.positionCharge,
    c.reference,
  ];
  const tries = candidats
    .map((c, i) => ({ c, i, k: cle(c) }))
    .sort((a, b) => {
      for (let j = 0; j < a.k.length; j++) if (a.k[j] !== b.k[j]) return a.k[j] ? -1 : 1;
      return a.i - b.i;
    })
    .map(({ c }) => ({ exercice: c, memeZone: c.zone === depart.zone }));

  // S'il y a des équivalents sur la même zone, on n'affiche qu'eux.
  const memeZone = tries.filter((t) => t.memeZone);
  return (memeZone.length > 0 ? memeZone : tries).slice(0, limite);
}
