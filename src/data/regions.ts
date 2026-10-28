/**
 * Zones dessinées sur la silhouette (face et dos) et lien avec les muscles du catalogue.
 * Le muscle principal d'un exercice est colorié en rouge vif, les secondaires en rouge clair.
 * Pour certains muscles, la zone visée affine le dessin (ex. haut des pecs seulement).
 */
import type { MuscleId } from './muscles';
import type { ExerciceCatalogue } from './types';

export const REGIONS_FACE = [
  'trap-face', 'delt-avant', 'pec-haut', 'pec-bas', 'biceps', 'avant-bras-face',
  'abdos-droit', 'obliques', 'quadriceps', 'adducteurs', 'mollets-face',
] as const;

export const REGIONS_DOS = [
  'trap', 'delt-arriere', 'dos', 'lombaires', 'triceps', 'avant-bras-dos',
  'fessiers', 'ischios', 'mollets',
] as const;

export type Region = (typeof REGIONS_FACE)[number] | (typeof REGIONS_DOS)[number];
export type Intensite = 'fort' | 'leger';
export type CarteRegions = Partial<Record<Region, Intensite>>;

/** Zones du dessin couvertes par chaque muscle. */
export const REGIONS_DU_MUSCLE: Record<MuscleId, Region[]> = {
  pectoraux: ['pec-haut', 'pec-bas'],
  dos: ['dos'],
  lombaires: ['lombaires'],
  epaules: ['delt-avant', 'delt-arriere'],
  trapezes: ['trap', 'trap-face'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  'avant-bras': ['avant-bras-face', 'avant-bras-dos'],
  quadriceps: ['quadriceps'],
  ischios: ['ischios'],
  fessiers: ['fessiers'],
  adducteurs: ['adducteurs'],
  mollets: ['mollets', 'mollets-face'],
  abdos: ['abdos-droit', 'obliques'],
};

/**
 * Parties du muscle principal travaillées le plus fort selon la zone visée.
 * Le reste du muscle principal est colorié en rouge clair.
 */
const ZONE_PRECISE: Partial<Record<MuscleId, Record<string, Region[]>>> = {
  pectoraux: { haut: ['pec-haut'], bas: ['pec-bas'] },
  epaules: { avant: ['delt-avant'], arriere: ['delt-arriere'] },
  abdos: { 'grand-droit': ['abdos-droit'], obliques: ['obliques'] },
};

/** Coloriage de la silhouette pour un exercice. */
export function regionsExercice(e: ExerciceCatalogue): CarteRegions {
  const carte: CarteRegions = {};
  for (const m of e.musclesSecondaires) for (const r of REGIONS_DU_MUSCLE[m]) carte[r] = 'leger';
  const principal = REGIONS_DU_MUSCLE[e.musclePrincipal];
  const precis = ZONE_PRECISE[e.musclePrincipal]?.[e.zone];
  for (const r of principal) carte[r] = !precis || precis.includes(r) ? 'fort' : 'leger';
  return carte;
}

const BAS_DU_CORPS: ReadonlySet<Region> = new Set([
  'quadriceps', 'adducteurs', 'mollets-face', 'fessiers', 'ischios', 'mollets',
]);

/** Cadrage d'une miniature : bas du corps si tout le rouge vif est sur les jambes, sinon haut. */
export function meilleurCadrage(carte: CarteRegions): 'haut' | 'bas' {
  const forts = (Object.keys(carte) as Region[]).filter((r) => carte[r] === 'fort');
  return forts.length > 0 && forts.every((r) => BAS_DU_CORPS.has(r)) ? 'bas' : 'haut';
}

/** Vue la plus parlante pour une miniature : celle qui montre le plus de rouge vif. */
export function meilleureVue(carte: CarteRegions): 'face' | 'dos' {
  const score = (liste: readonly Region[]) =>
    liste.reduce((t, r) => t + (carte[r] === 'fort' ? 10 : carte[r] === 'leger' ? 1 : 0), 0);
  return score(REGIONS_DOS) > score(REGIONS_FACE) ? 'dos' : 'face';
}
