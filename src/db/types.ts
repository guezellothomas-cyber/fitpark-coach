/**
 * Types des données enregistrées sur le téléphone.
 * Tout est stocké dans IndexedDB (base locale du navigateur), rien ne part sur internet.
 */
import type { MuscleId } from '../data/muscles';

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
  /** Demander au raccourci de revenir automatiquement à l'app (paramètre x-success). */
  retourAuto: boolean;
}

/** Disponibilité d'un exercice dans ma salle. Absent de la table = disponible. */
export interface DispoSalle {
  exerciceId: string;
  disponible: boolean;
}

/** Ce qui est prévu pour une série : sa charge en kg et son objectif de reps (ou de secondes). */
export interface SeriePrevue {
  charge: number;
  reps: number;
}

/** Un exercice prévu dans une séance type. */
export interface ExerciceDeSeance {
  exerciceId: string;
  /** Une entrée par série, dans l'ordre : leur nombre est le nombre de séries. */
  prevues: SeriePrevue[];
  /** Interrupteur "Même charge pour toutes les séries". */
  memeCharge: boolean;
  /** Fourchette de reps de l'exercice : sert à la surcharge progressive. */
  repsMin: number;
  repsMax: number;
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
  /** Muscles ciblés, dans l'ordre de priorité (le premier est le muscle principal de la séance). */
  muscles: MuscleId[];
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

/** Une séance réellement effectuée (historique), ou en cours si `fin` est null. */
export interface Entrainement {
  id: string;
  seanceId: string | null;
  nom: string;
  debut: number;
  fin: number | null;
  series: SerieFaite[];
  /** Copie du programme au lancement : modifier la séance type ensuite ne change pas celle-ci. */
  plan?: ExerciceDeSeance[];
  /** Exercice affiché (position dans le plan). */
  indexCourant?: number;
  /**
   * Chrono de repos : horodatage de fin (et non un compte à rebours), pour rester juste
   * même si l'app passe en arrière-plan ou est fermée. null = pas de repos en cours.
   */
  finRepos?: number | null;
  /** Durée totale du repos en cours, en secondes (pour la barre de progression). */
  dureeRepos?: number;
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
