/**
 * Le guide : suggère 2 exercices complémentaires à partir d'un premier exercice.
 * Règles écrites en dur (pas d'IA) :
 *   1. Type de mouvement : après un polyarticulaire, une isolation, et l'inverse.
 *   2. Zone : une partie du muscle pas encore travaillée.
 *   3. Position de charge : étirement après contraction, et l'inverse.
 *   4. Outil : après du libre, poulie ou machine (et après machine/poulie, du libre).
 * Muscles opposés : les fléchisseurs de l'avant-bras appellent les extenseurs, et l'inverse.
 * Filtres : jamais un exercice absent de ma salle, jamais un quasi-doublon
 * (même muscle, même zone, même matériel, même mouvement) d'un exercice déjà choisi.
 *
 * Les deux suggestions ont chacune un rôle :
 *   - la 1re change de ZONE en gardant le même type de mouvement
 *     (ex. après le développé couché, un développé incliné pour le haut des pecs) ;
 *   - la 2e est un COMPLÉMENT : type de mouvement inverse, zone encore libre,
 *     position de charge inverse (ex. un écarté à la poulie).
 * À égalité, le guide préfère les exercices de référence (classiques), puis l'ordre du catalogue.
 */
import { libelleZone, type MuscleId } from '../data/muscles';
import type { ExerciceCatalogue, TypeExercice } from '../data/types';

export interface Suggestion {
  exercice: ExerciceCatalogue;
  /** Pourquoi cet exercice est proposé, en une ligne. */
  raison: string;
}

type Candidat = ExerciceCatalogue & { disponibleDansMaSalle?: boolean };

/**
 * Muscles travaillés ensemble pour la règle de zone : sur une séance cuisses,
 * l'arrière de la cuisse (ischios) est une "zone" à couvrir après les quadriceps.
 */
const MUSCLES_ASSOCIES: Partial<Record<MuscleId, MuscleId[]>> = {
  quadriceps: ['ischios'],
  ischios: ['quadriceps'],
};

/** Zones qui se répondent dans un même muscle : l'une appelle l'autre en priorité. */
const ZONES_OPPOSEES: Partial<Record<MuscleId, Record<string, string>>> = {
  'avant-bras': { flechisseurs: 'extenseurs', extenseurs: 'flechisseurs' },
};

const LIBRE: ReadonlySet<TypeExercice> = new Set(['libre', 'poids-du-corps']);

/** Deux exercices quasi identiques : même muscle, même zone, même matériel, même mouvement. */
export function estQuasiDoublon(a: ExerciceCatalogue, b: ExerciceCatalogue): boolean {
  return (
    a.musclePrincipal === b.musclePrincipal &&
    a.zone === b.zone &&
    a.type === b.type &&
    a.mouvement.articulation === b.mouvement.articulation &&
    a.mouvement.sens === b.mouvement.sens
  );
}

const cleZone = (e: ExerciceCatalogue) => `${e.musclePrincipal}/${e.zone}`;

/** Ce que chaque candidat apporte par rapport à l'exercice de départ. */
function analyser(c: ExerciceCatalogue, depart: ExerciceCatalogue, zonesFaites: Set<string>) {
  return {
    zoneOpposee:
      c.musclePrincipal === depart.musclePrincipal && ZONES_OPPOSEES[depart.musclePrincipal]?.[depart.zone] === c.zone,
    zoneNouvelle: !zonesFaites.has(cleZone(c)),
    memeMuscle: c.musclePrincipal === depart.musclePrincipal,
    articulationInverse: c.mouvement.articulation !== depart.mouvement.articulation,
    chargeInverse: c.positionCharge !== depart.positionCharge,
    outilVarie: LIBRE.has(depart.type) !== LIBRE.has(c.type),
    memeMateriel: c.type === depart.type,
    reference: c.reference,
  };
}
type Analyse = ReturnType<typeof analyser>;

/** Ordre de priorité des critères pour chaque rôle de suggestion. */
const PRIORITES: Record<'zone' | 'complement', (a: Analyse) => boolean[]> = {
  zone: (a) => [a.zoneOpposee && a.zoneNouvelle, a.zoneNouvelle, a.memeMuscle, !a.articulationInverse, a.chargeInverse, a.reference, a.memeMateriel],
  complement: (a) => [a.articulationInverse, a.zoneNouvelle, a.memeMuscle, a.reference, a.chargeInverse, a.outilVarie],
};

/** Compare deux listes de critères : le premier critère différent décide. */
function comparer(a: boolean[], b: boolean[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] ? -1 : 1;
  return 0;
}

function expliquer(c: ExerciceCatalogue, depart: ExerciceCatalogue, a: Analyse): string {
  const raisons: string[] = [];
  if (a.zoneOpposee) raisons.push('muscles opposés, pour équilibrer');
  if (a.zoneNouvelle) raisons.push(`${libelleZone(c.musclePrincipal, c.zone)} pas encore travaillé`);
  if (a.articulationInverse) {
    raisons.push(
      depart.mouvement.articulation === 'polyarticulaire'
        ? 'isolation après un polyarticulaire'
        : 'polyarticulaire après une isolation',
    );
  }
  if (a.chargeInverse) {
    raisons.push(c.positionCharge === 'etirement' ? 'chargé en étirement' : 'chargé en contraction');
  }
  if (raisons.length < 2 && a.outilVarie) {
    raisons.push(LIBRE.has(depart.type) ? 'poulie ou machine après du libre' : 'libre après la machine');
  }
  if (raisons.length === 0) raisons.push('classique pour ce muscle');
  const texte = raisons.slice(0, 2).join(' · ');
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/**
 * Propose jusqu'à 2 exercices pour compléter `depart`.
 * @param catalogue  exercices possibles (ceux absents de ma salle sont ignorés)
 * @param dejaChoisis exercices déjà dans la séance (le départ est toujours compté)
 */
export function suggerer(
  depart: ExerciceCatalogue,
  catalogue: readonly Candidat[],
  dejaChoisis: readonly ExerciceCatalogue[] = [],
): Suggestion[] {
  const choisis = [depart, ...dejaChoisis.filter((e) => e.id !== depart.id)];
  const muscles = new Set<MuscleId>([depart.musclePrincipal, ...(MUSCLES_ASSOCIES[depart.musclePrincipal] ?? [])]);
  const suggestions: Suggestion[] = [];

  for (const role of ['zone', 'complement'] as const) {
    const zonesFaites = new Set(choisis.map(cleZone));
    const candidats = catalogue.filter(
      (c) =>
        c.disponibleDansMaSalle !== false &&
        muscles.has(c.musclePrincipal) &&
        !choisis.some((x) => x.id === c.id || estQuasiDoublon(x, c)),
    );
    // Tri stable : à égalité parfaite, l'ordre du catalogue est conservé.
    const classes = candidats
      .map((c) => ({ c, a: analyser(c, depart, zonesFaites) }))
      .sort((x, y) => comparer(PRIORITES[role](x.a), PRIORITES[role](y.a)));
    const meilleur = classes[0];
    if (!meilleur) break;
    suggestions.push({ exercice: meilleur.c, raison: expliquer(meilleur.c, depart, meilleur.a) });
    choisis.push(meilleur.c);
  }
  return suggestions;
}
