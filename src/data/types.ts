import type { MuscleId } from './muscles';

/** Type de matériel. "Machine guidée" = à plaques sélectionnées par une goupille (ou Smith). */
export type TypeExercice = 'machine-guidee' | 'machine-disques' | 'poulie' | 'libre' | 'poids-du-corps';

export const TYPES: readonly { id: TypeExercice; libelle: string }[] = [
  { id: 'machine-guidee', libelle: 'Machine guidée' },
  { id: 'machine-disques', libelle: 'Machine à disques' },
  { id: 'poulie', libelle: 'Poulie' },
  { id: 'libre', libelle: 'Libre' },
  { id: 'poids-du-corps', libelle: 'Poids du corps' },
];

export function libelleType(t: TypeExercice): string {
  return TYPES.find((x) => x.id === t)?.libelle ?? t;
}

/**
 * Polyarticulaire : plusieurs articulations bougent (ex. développé couché : épaule + coude).
 * Isolation : une seule articulation bouge (ex. leg extension : genou).
 */
export type Articulation = 'polyarticulaire' | 'isolation';

/**
 * Sens de l'effort, utilisé pour l'équilibre poussée / tirage.
 * "neutre" = abdos, adducteurs, abducteurs : ni poussée ni tirage, non comptés dans l'équilibre.
 * Jambes : quadriceps et mollets comptent en poussée, chaîne arrière (ischios, fessiers,
 * lombaires) en tirage.
 */
export type Sens = 'poussee' | 'tirage' | 'neutre';

/**
 * Étirement : l'exercice est le plus dur quand le muscle est allongé (ex. écarté haltères en bas).
 * Contraction : il est le plus dur quand le muscle est raccourci (ex. leg extension jambes tendues).
 */
export type PositionCharge = 'etirement' | 'contraction';

/** Un exercice tel que décrit dans le catalogue de l'app. */
export interface ExerciceCatalogue {
  id: string;
  nom: string;
  type: TypeExercice;
  musclePrincipal: MuscleId;
  musclesSecondaires: MuscleId[];
  mouvement: { articulation: Articulation; sens: Sens };
  /** Partie du muscle principal visée (voir ZONES dans muscles.ts). */
  zone: string;
  positionCharge: PositionCharge;
  /** 2 ou 3 consignes courtes d'exécution. */
  consignes: string[];
  /**
   * Exercice de référence : un classique que le guide préfère proposer
   * quand plusieurs exercices répondent aussi bien aux règles.
   */
  reference: boolean;
}

/** Un exercice avec mon réglage personnel "disponible dans ma salle". */
export interface Exercice extends ExerciceCatalogue {
  disponibleDansMaSalle: boolean;
}
