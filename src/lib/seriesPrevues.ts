/**
 * Séries prévues d'un exercice : chaque série a sa charge et son objectif de reps.
 * Ces fonctions ne modifient pas l'exercice reçu : elles renvoient sa nouvelle version.
 */
import type { ExerciceDeSeance, SeriePrevue } from '../db/types';
import { formatNombre } from './format';

export const PAS_PYRAMIDE = 2.5;

const arrondi = (n: number) => Math.round(n * 100) / 100;

export function creerPrevues(nombre: number, charge: number, reps: number): SeriePrevue[] {
  return Array.from({ length: nombre }, () => ({ charge, reps }));
}

/** Ajoute (en recopiant la dernière série) ou retire des séries à la fin. */
export function changerNombreSeries(e: ExerciceDeSeance, nombre: number): ExerciceDeSeance {
  const derniere = e.prevues.at(-1) ?? { charge: 0, reps: e.repsMax };
  const prevues = Array.from({ length: nombre }, (_, i) => e.prevues[i] ?? { ...derniere });
  return { ...e, prevues };
}

/** Change la charge d'une seule série : l'interrupteur "même charge" se désactive tout seul. */
export function changerChargeSerie(e: ExerciceDeSeance, index: number, charge: number): ExerciceDeSeance {
  if (e.prevues[index]?.charge === charge) return e;
  return {
    ...e,
    memeCharge: false,
    prevues: e.prevues.map((p, i) => (i === index ? { ...p, charge } : p)),
  };
}

export function changerRepsSerie(e: ExerciceDeSeance, index: number, reps: number): ExerciceDeSeance {
  return { ...e, prevues: e.prevues.map((p, i) => (i === index ? { ...p, reps } : p)) };
}

/** Applique la même charge à toutes les séries. */
export function changerChargeCommune(e: ExerciceDeSeance, charge: number): ExerciceDeSeance {
  return { ...e, memeCharge: true, prevues: e.prevues.map((p) => ({ ...p, charge })) };
}

/** Interrupteur "même charge" : en l'activant, toutes les séries prennent la charge de la série 1. */
export function basculerMemeCharge(e: ExerciceDeSeance, actif: boolean): ExerciceDeSeance {
  return actif ? changerChargeCommune(e, e.prevues[0]?.charge ?? 0) : { ...e, memeCharge: false };
}

/** Raccourci "Pyramide" : charge de la série 1, puis un pas de plus à chaque série. */
export function appliquerPyramide(e: ExerciceDeSeance, chargeDepart: number, pas: number): ExerciceDeSeance {
  return {
    ...e,
    memeCharge: false,
    prevues: e.prevues.map((p, i) => ({ ...p, charge: arrondi(chargeDepart + i * pas) })),
  };
}

/** Change la fourchette de reps : les objectifs restent dedans, et suivent le haut de fourchette. */
export function changerFourchette(e: ExerciceDeSeance, repsMin: number, repsMax: number): ExerciceDeSeance {
  const prevues = e.prevues.map((p) => ({
    ...p,
    reps: p.reps === e.repsMax ? repsMax : Math.min(repsMax, Math.max(repsMin, p.reps)),
  }));
  return { ...e, repsMin, repsMax, prevues };
}

/** "60 kg", "25 / 27,5 / 27,5 kg", ou rien sans charge. */
export function resumerCharges(prevues: readonly SeriePrevue[]): string {
  const charges = prevues.map((p) => p.charge);
  if (charges.every((c) => c === 0)) return '';
  if (charges.every((c) => c === charges[0])) return `${formatNombre(charges[0]!)} kg`;
  return `${charges.map(formatNombre).join(' / ')} kg`;
}
