import { describe, expect, it } from 'vitest';
import type { SerieFaite } from '../db/types';
import { arrondirCharge, proposerSurcharge, seriesEchauffement } from './progression';

const s = (charge: number, reps: number, echauffement = false): SerieFaite => ({
  exerciceId: 'dc', charge, reps, faiteLe: 0, echauffement,
});
const objectif = { series: 3, repsMax: 10 };

describe('surcharge progressive', () => {
  it('propose +2,5 kg quand toutes les séries ont atteint le haut de la fourchette', () => {
    expect(proposerSurcharge([s(60, 10), s(60, 10), s(60, 11)], objectif, 2.5)).toEqual({ charge: 62.5, avant: 60 });
  });

  it('ne propose rien si une série est en dessous', () => {
    expect(proposerSurcharge([s(60, 10), s(60, 10), s(60, 8)], objectif, 2.5)).toBeNull();
  });

  it('ne propose rien s’il manquait des séries', () => {
    expect(proposerSurcharge([s(60, 10), s(60, 10)], objectif, 2.5)).toBeNull();
  });

  it('ignore les séries d’échauffement', () => {
    expect(proposerSurcharge([s(30, 5, true), s(60, 10), s(60, 10), s(60, 10)], objectif, 2.5)?.charge).toBe(62.5);
  });

  it('ne propose rien au poids du corps', () => {
    expect(proposerSurcharge([s(0, 12), s(0, 12), s(0, 12)], objectif, 2.5)).toBeNull();
  });

  it('respecte le pas réglé', () => {
    expect(proposerSurcharge([s(14, 12), s(14, 12), s(14, 12)], { series: 3, repsMax: 12 }, 1)?.charge).toBe(15);
  });
});

describe('séries d’échauffement', () => {
  it('donne 3 séries pour une charge lourde', () => {
    expect(seriesEchauffement(100, 2.5)).toEqual([
      { charge: 40, reps: 10, pourcentage: 40 },
      { charge: 60, reps: 6, pourcentage: 60 },
      { charge: 80, reps: 3, pourcentage: 80 },
    ]);
  });

  it('arrondit au pas de charge', () => {
    expect(seriesEchauffement(62.5, 2.5).map((x) => x.charge)).toEqual([25, 37.5, 50]);
  });

  it('donne 2 séries pour une charge légère', () => {
    expect(seriesEchauffement(20, 2.5)).toEqual([
      { charge: 10, reps: 10, pourcentage: 50 },
      { charge: 15, reps: 5, pourcentage: 75 },
    ]);
  });

  it('ne propose rien sans charge', () => {
    expect(seriesEchauffement(0, 2.5)).toEqual([]);
  });

  it('n’arrondit jamais en dessous d’un pas', () => {
    expect(arrondirCharge(0.4, 2.5)).toBe(2.5);
  });
});
