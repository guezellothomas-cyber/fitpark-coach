/**
 * Progression : surcharge progressive et séries d'échauffement.
 */
import type { ExerciceDeSeance, SerieFaite } from '../db/types';

/** Arrondit une charge au pas le plus proche (ex. 2,5 kg), jamais en dessous d'un pas. */
export function arrondirCharge(charge: number, pas: number): number {
  if (pas <= 0) return charge;
  return Math.max(pas, Math.round(charge / pas) * pas);
}

export interface Surcharge {
  /** Charge proposée pour aujourd'hui. */
  charge: number;
  /** Charge utilisée la dernière fois. */
  avant: number;
}

/**
 * Surcharge progressive, série par série : si la même série a atteint le haut de la fourchette
 * la dernière fois, on propose d'y ajouter un pas de charge. Les autres séries ne bougent pas.
 * Rien n'est proposé au poids du corps (charge 0) ni pour une série non faite la dernière fois.
 */
export function proposerSurcharge(
  derniereFois: readonly SerieFaite[],
  rang: number,
  repsMax: number,
  pas: number,
): Surcharge | null {
  const serie = derniereFois.filter((s) => !s.echauffement)[rang];
  if (!serie || serie.charge <= 0 || serie.reps < repsMax) return null;
  return { charge: Math.round((serie.charge + pas) * 100) / 100, avant: serie.charge };
}

/**
 * Valeurs pré-remplies pour une série : celles de la MÊME série la dernière fois,
 * sinon ce qui est prévu pour cette série, sinon la série précédente de la séance.
 */
export function proposerSerie(item: ExerciceDeSeance, faites: readonly SerieFaite[], derniereFois: readonly SerieFaite[]) {
  const rang = faites.length;
  const memeSerie = derniereFois[rang];
  const prevue = item.prevues[rang];
  const precedente = faites.at(-1);
  return {
    charge: memeSerie?.charge ?? prevue?.charge ?? precedente?.charge ?? 0,
    reps: memeSerie?.reps ?? prevue?.reps ?? precedente?.reps ?? item.repsMax,
  };
}

export interface SerieEchauffement {
  charge: number;
  reps: number;
  /** Pourcentage de la charge de travail. */
  pourcentage: number;
}

/**
 * Séries d'approche calculées à partir de la charge de travail :
 *   charge ≥ 40 kg : 3 séries (40 % × 10, 60 % × 6, 80 % × 3)
 *   charge < 40 kg : 2 séries (50 % × 10, 75 % × 5)
 * Les charges sont arrondies au pas ; une série identique à la précédente est retirée.
 */
export function seriesEchauffement(chargeTravail: number, pas: number): SerieEchauffement[] {
  if (chargeTravail <= 0) return [];
  const schema =
    chargeTravail >= 40
      ? [
          { pourcentage: 40, reps: 10 },
          { pourcentage: 60, reps: 6 },
          { pourcentage: 80, reps: 3 },
        ]
      : [
          { pourcentage: 50, reps: 10 },
          { pourcentage: 75, reps: 5 },
        ];
  const resultat: SerieEchauffement[] = [];
  for (const { pourcentage, reps } of schema) {
    const charge = arrondirCharge((chargeTravail * pourcentage) / 100, pas);
    if (charge >= chargeTravail) continue;
    if (resultat.at(-1)?.charge === charge) continue;
    resultat.push({ charge, reps, pourcentage });
  }
  return resultat;
}
