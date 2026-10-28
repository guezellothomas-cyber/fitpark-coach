/**
 * Types des données enregistrées sur le téléphone.
 * Tout est stocké dans IndexedDB (base locale du navigateur), rien ne part sur internet.
 */

export type Theme = 'sombre' | 'clair' | 'auto';

/** Réglages de l'app (une seule ligne, identifiant "app"). */
export interface Reglages {
  id: 'app';
  theme: Theme;
  /** Son court à la fin du repos quand l'app est ouverte. */
  son: boolean;
  /** Pas des boutons + / - de charge, en kg. */
  pasCharge: number;
  /** Temps de repos proposé par défaut pour un nouvel exercice, en secondes. */
  reposParDefaut: number;
  /** Lancer le raccourci iOS "Repos FitPark" (minuteur Horloge / Dynamic Island) à chaque série. */
  minuteurIphone: boolean;
}

/** Disponibilité d'un exercice dans ma salle. Absent de la table = disponible. */
export interface DispoSalle {
  exerciceId: string;
  disponible: boolean;
}

/** Un exercice prévu dans une séance type. */
export interface ExerciceDeSeance {
  exerciceId: string;
  series: number;
  repsMin: number;
  repsMax: number;
  /** Charge de départ en kg. */
  charge: number;
  /** Repos après chaque série, en secondes. */
  repos: number;
  /** Vrai si cet exercice s'enchaîne en superset avec le suivant. */
  supersetAvecSuivant: boolean;
}

/** Une séance type (modèle réutilisable), ex. "Pecs / Triceps". */
export interface Seance {
  id: string;
  nom: string;
  /** Jours de la semaine : 1 = lundi … 7 = dimanche. */
  jours: number[];
  muscles: string[];
  exercices: ExerciceDeSeance[];
  creeLe: number;
  modifieLe: number;
}

/** Une série réellement effectuée en salle. */
export interface SerieFaite {
  exerciceId: string;
  charge: number;
  reps: number;
  faiteLe: number;
  echauffement: boolean;
}

/** Une séance réellement effectuée (historique). */
export interface Entrainement {
  id: string;
  seanceId: string | null;
  nom: string;
  debut: number;
  fin: number | null;
  series: SerieFaite[];
}

/** Poids de corps et mensurations à une date donnée (en kg et cm). */
export interface Mesure {
  id: string;
  /** Date au format AAAA-MM-JJ. */
  date: string;
  poids?: number;
  tourTaille?: number;
  tourPoitrine?: number;
  tourBras?: number;
  tourCuisse?: number;
}
