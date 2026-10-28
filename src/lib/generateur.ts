/**
 * Générateur de programme : à partir du nombre de jours d'entraînement par semaine,
 * propose une répartition (haut / bas, poussée / tirage / jambes…) et remplit chaque séance
 * avec des exercices disponibles dans ma salle, choisis avec les règles du guide.
 * Tout reste modifiable ensuite : ce sont des séances ordinaires.
 */
import type { MuscleId } from '../data/muscles';
import type { ExerciceCatalogue, TypeExercice } from '../data/types';
import type { ExerciceDeSeance } from '../db/types';
import { estQuasiDoublon, suggerer } from './guide';
import { ordonner } from './ordre';

type Candidat = ExerciceCatalogue & { disponibleDansMaSalle?: boolean };

/** Un emplacement de la séance : n exercices pour un muscle (éventuellement une zone précise). */
interface Emplacement {
  muscle: MuscleId;
  n: number;
  zone?: string;
}

interface ModeleSeance {
  nom: string;
  /** A : plutôt du libre en premier exercice ; B : plutôt des machines (pour varier). */
  variante: 'A' | 'B';
  emplacements: Emplacement[];
}

export interface Repartition {
  id: string;
  nom: string;
  description: string;
  seances: ModeleSeance[];
}

// ───────── Modèles de séances ─────────
const POUSSEE = (variante: 'A' | 'B' = 'A'): ModeleSeance => ({
  nom: variante === 'A' ? 'Poussée' : 'Poussée B',
  variante,
  emplacements: [
    { muscle: 'pectoraux', n: 3 },
    { muscle: 'epaules', n: 1, zone: 'avant' },
    { muscle: 'epaules', n: 1, zone: 'cote' },
    { muscle: 'triceps', n: 2 },
  ],
});
const TIRAGE = (variante: 'A' | 'B' = 'A'): ModeleSeance => ({
  nom: variante === 'A' ? 'Tirage' : 'Tirage B',
  variante,
  emplacements: [{ muscle: 'dos', n: 3 }, { muscle: 'epaules', n: 1, zone: 'arriere' }, { muscle: 'biceps', n: 2 }],
});
const JAMBES = (variante: 'A' | 'B' = 'A'): ModeleSeance => ({
  nom: variante === 'A' ? 'Jambes' : 'Jambes B',
  variante,
  emplacements: [
    { muscle: 'quadriceps', n: 2 },
    { muscle: 'ischios', n: 2 },
    { muscle: 'fessiers', n: 1 },
    { muscle: 'mollets', n: 1 },
    { muscle: 'abdos', n: 1 },
  ],
});
const HAUT = (variante: 'A' | 'B'): ModeleSeance => ({
  nom: `Haut ${variante}`,
  variante,
  emplacements: [
    { muscle: 'pectoraux', n: 2 },
    { muscle: 'dos', n: 2 },
    { muscle: 'epaules', n: 1, zone: 'cote' },
    { muscle: 'biceps', n: 1 },
    { muscle: 'triceps', n: 1 },
  ],
});
const BAS = (variante: 'A' | 'B'): ModeleSeance => ({
  nom: `Bas ${variante}`,
  variante,
  emplacements: [
    { muscle: 'quadriceps', n: 2 },
    { muscle: 'ischios', n: variante === 'A' ? 1 : 2 },
    { muscle: 'fessiers', n: 1 },
    { muscle: 'mollets', n: 1 },
    { muscle: 'abdos', n: 1 },
  ],
});
const CORPS_ENTIER = (variante: 'A' | 'B'): ModeleSeance => ({
  nom: `Corps entier ${variante}`,
  variante,
  emplacements: [
    { muscle: 'quadriceps', n: 1 },
    { muscle: 'pectoraux', n: 1 },
    { muscle: 'dos', n: 2 },
    { muscle: 'ischios', n: 1 },
    { muscle: 'epaules', n: 1, zone: 'cote' },
    { muscle: 'abdos', n: 1 },
  ],
});

/** Répartitions possibles pour chaque nombre de jours ; la première est celle proposée par défaut. */
export const REPARTITIONS: Record<number, Repartition[]> = {
  2: [
    {
      id: 'corps-entier-2',
      nom: 'Corps entier',
      description: 'Deux séances complètes : chaque muscle travaillé 2 fois par semaine.',
      seances: [CORPS_ENTIER('A'), CORPS_ENTIER('B')],
    },
  ],
  3: [
    {
      id: 'ppl',
      nom: 'Poussée / Tirage / Jambes',
      description: 'Une séance par famille de mouvements : chaque muscle 1 fois par semaine, avec plus de volume.',
      seances: [POUSSEE(), TIRAGE(), JAMBES()],
    },
    {
      id: 'corps-entier-3',
      nom: 'Corps entier',
      description: 'Trois séances complètes en alternance : chaque muscle 3 fois par semaine.',
      seances: [CORPS_ENTIER('A'), CORPS_ENTIER('B'), { ...CORPS_ENTIER('A'), nom: 'Corps entier C', variante: 'B' }],
    },
  ],
  4: [
    {
      id: 'haut-bas',
      nom: 'Haut / Bas',
      description: 'Haut du corps et jambes en alternance : chaque muscle 2 fois par semaine.',
      seances: [HAUT('A'), BAS('A'), HAUT('B'), BAS('B')],
    },
    {
      id: 'ppl-haut',
      nom: 'Poussée / Tirage / Jambes + Haut',
      description: 'Les trois familles, plus une séance haut du corps pour un 2e passage.',
      seances: [POUSSEE(), TIRAGE(), JAMBES(), { ...HAUT('B'), nom: 'Haut du corps' }],
    },
  ],
  5: [
    {
      id: 'haut-bas-ppl',
      nom: 'Haut / Bas + Poussée / Tirage / Jambes',
      description: 'Le mix le plus complet : chaque muscle 2 fois par semaine.',
      // Variante B (plus de machines) pour varier, sans le suffixe : il n'y a qu'une séance de chaque.
      seances: [
        HAUT('A'),
        BAS('A'),
        { ...POUSSEE('B'), nom: 'Poussée' },
        { ...TIRAGE('B'), nom: 'Tirage' },
        { ...JAMBES('B'), nom: 'Jambes' },
      ],
    },
    {
      id: 'split',
      nom: 'Un groupe par jour',
      description: 'Pecs, dos, jambes, épaules, bras : beaucoup de volume par muscle, 1 fois par semaine.',
      seances: [
        { nom: 'Pecs', variante: 'A', emplacements: [{ muscle: 'pectoraux', n: 4 }, { muscle: 'abdos', n: 1 }] },
        { nom: 'Dos', variante: 'A', emplacements: [{ muscle: 'dos', n: 4 }, { muscle: 'trapezes', n: 1 }] },
        JAMBES(),
        {
          nom: 'Épaules',
          variante: 'B',
          emplacements: [
            { muscle: 'epaules', n: 1, zone: 'avant' },
            { muscle: 'epaules', n: 2, zone: 'cote' },
            { muscle: 'epaules', n: 1, zone: 'arriere' },
            { muscle: 'abdos', n: 1 },
          ],
        },
        { nom: 'Bras', variante: 'B', emplacements: [{ muscle: 'biceps', n: 3 }, { muscle: 'triceps', n: 3 }] },
      ],
    },
  ],
  6: [
    {
      id: 'ppl-2',
      nom: 'Poussée / Tirage / Jambes × 2',
      description: 'Le cycle complet deux fois : chaque muscle 2 fois par semaine.',
      seances: [POUSSEE('A'), TIRAGE('A'), JAMBES('A'), POUSSEE('B'), TIRAGE('B'), JAMBES('B')],
    },
  ],
};

/** Jours proposés par défaut (1 = lundi … 7 = dimanche), avec du repos entre les séances. */
export const JOURS_PAR_DEFAUT: Record<number, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
};

export interface SeanceGeneree {
  nom: string;
  muscles: MuscleId[];
  exercices: ExerciceDeSeance[];
}

const LIBRE: ReadonlySet<TypeExercice> = new Set(['libre', 'poids-du-corps']);

/** Réglages par défaut : 1er polyarticulaire lourd, autres poly, isolation, abdos. */
function parametres(e: ExerciceCatalogue, premier: boolean): Omit<ExerciceDeSeance, 'exerciceId' | 'charge' | 'supersetAvecSuivant'> {
  if (e.mesure === 'secondes') return { series: 3, repsMin: 30, repsMax: 45, repos: 60 };
  if (e.musclePrincipal === 'abdos') return { series: 3, repsMin: 12, repsMax: 15, repos: 60 };
  if (e.mouvement.articulation === 'polyarticulaire') {
    return premier ? { series: 4, repsMin: 6, repsMax: 8, repos: 150 } : { series: 3, repsMin: 8, repsMax: 10, repos: 120 };
  }
  return { series: 3, repsMin: 10, repsMax: 12, repos: 75 };
}

function trierPar(cles: (c: Candidat) => boolean[]) {
  return (a: Candidat, b: Candidat) => {
    const ka = cles(a);
    const kb = cles(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] ? -1 : 1;
    return 0;
  };
}

/**
 * Remplit une séance. `dejaAilleurs` = exercices choisis dans les autres séances du programme :
 * on les évite si possible, pour varier entre les séances A et B.
 * `graine` change le premier exercice choisi (bouton "Autre proposition").
 */
function remplirSeance(modele: ModeleSeance, catalogue: readonly Candidat[], dejaAilleurs: Set<string>, graine: number): SeanceGeneree {
  const dispo = catalogue.filter((c) => c.disponibleDansMaSalle !== false);
  const choisis: ExerciceCatalogue[] = [];
  const libreOk = (c: Candidat) => (modele.variante === 'A' ? LIBRE.has(c.type) : !LIBRE.has(c.type));
  const possible = (c: Candidat) => !choisis.some((x) => x.id === c.id || estQuasiDoublon(x, c));
  // Trop proche d'un exercice déjà dans la séance (ex. deux pull-overs, deux dips) : à éviter.
  const similaire = (c: Candidat) =>
    choisis.some(
      (x) =>
        x.musclePrincipal === c.musclePrincipal &&
        x.zone === c.zone &&
        x.mouvement.articulation === c.mouvement.articulation,
    );

  for (const [rang, emp] of modele.emplacements.entries()) {
    const duMuscle = dispo.filter((c) => c.musclePrincipal === emp.muscle && (!emp.zone || c.zone === emp.zone));
    const pris: ExerciceCatalogue[] = [];

    // 1er exercice : sans zone imposée, un polyarticulaire de référence (base lourde) ;
    // avec une zone imposée, d'abord l'exercice de référence de cette zone.
    const premiers = duMuscle
      .filter((c) => possible(c) && !similaire(c))
      .sort(
        trierPar((c) => {
          const poly = c.mouvement.articulation === 'polyarticulaire';
          return emp.zone
            ? [!dejaAilleurs.has(c.id), c.reference, libreOk(c), poly]
            : [!dejaAilleurs.has(c.id), poly, c.reference, libreOk(c)];
        }),
      );
    // La graine ("Autre proposition") fait choisir le 2e ou 3e meilleur exercice de base.
    const premier = premiers[(graine + (rang === 0 ? 0 : graine)) % Math.min(3, Math.max(1, premiers.length))];
    if (!premier) continue;
    pris.push(premier);
    choisis.push(premier);

    // Exercices suivants : les deux suggestions du guide dans l'ordre (autre zone, puis complément),
    // sinon un exercice du muscle qui couvre une zone encore libre.
    let file: ExerciceCatalogue[] = [];
    while (pris.length < emp.n) {
      if (file.length === 0) {
        file = suggerer(premier, dispo, choisis)
          .map((s) => s.exercice)
          .filter((e) => duMuscle.some((d) => d.id === e.id));
      }
      const depuisGuide =
        file.find((e) => possible(e) && !similaire(e) && !dejaAilleurs.has(e.id)) ??
        file.find((e) => possible(e) && !similaire(e));
      const proposition =
        depuisGuide ??
        duMuscle
          .filter(possible)
          .sort(
            trierPar((c) => [
              !similaire(c),
              !pris.some((p) => p.zone === c.zone),
              !dejaAilleurs.has(c.id),
              c.reference,
            ]),
          )[0];
      if (!proposition) break;
      file = file.filter((e) => e.id !== proposition.id);
      pris.push(proposition);
      choisis.push(proposition);
    }
  }

  const muscles = [...new Set(modele.emplacements.map((e) => e.muscle))];
  const items: ExerciceDeSeance[] = choisis.map((e) => ({
    exerciceId: e.id,
    charge: 0,
    supersetAvecSuivant: false,
    ...parametres(e, false),
  }));
  const ordonnes = ordonner(items, muscles);
  // Le tout premier exercice, s'il est polyarticulaire, devient l'exercice lourd de la séance.
  const tete = ordonnes[0] && choisis.find((c) => c.id === ordonnes[0]!.exerciceId);
  if (tete && tete.mouvement.articulation === 'polyarticulaire') {
    ordonnes[0] = { ...ordonnes[0]!, ...parametres(tete, true) };
  }
  return { nom: modele.nom, muscles, exercices: ordonnes };
}

/** Génère toutes les séances d'une répartition. */
export function genererProgramme(repartition: Repartition, catalogue: readonly Candidat[], graine = 0): SeanceGeneree[] {
  const dejaAilleurs = new Set<string>();
  return repartition.seances.map((modele) => {
    const seance = remplirSeance(modele, catalogue, dejaAilleurs, graine);
    for (const e of seance.exercices) dejaAilleurs.add(e.exerciceId);
    return seance;
  });
}
