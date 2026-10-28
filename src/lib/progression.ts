/**
 * Progression : surcharge progressive et séries d'échauffement.
 */
import type { SerieFaite } from '../db/types';

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
 * Surcharge progressive : si la dernière fois toutes les séries prévues ont atteint
 * le haut de la fourchette de reps, on propose d'ajouter un pas de charge.
 * Rien n'est proposé au poids du corps (charge 0) ou si des séries manquaient.
 */
export function proposerSurcharge(
  derniereFois: readonly SerieFaite[],
  objectif: { series: number; repsMax: number },
  pas: number,
): Surcharge | null {
  const series = derniereFois.filter((s) => !s.echauffement).slice(0, objectif.series);
  if (series.length < objectif.series || series.length === 0) return null;
  if (!series.every((s) => s.reps >= objectif.repsMax && s.charge > 0)) return null;
  const avant = Math.max(...series.map((s) => s.charge));
  return { charge: Math.round((avant + pas) * 100) / 100, avant };
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
