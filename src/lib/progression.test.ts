import { describe, expect, it } from 'vitest';
import type { ExerciceDeSeance, SerieFaite } from '../db/types';
import { arrondirCharge, proposerSerie, proposerSurcharge, seriesEchauffement } from './progression';

const s = (charge: number, reps: number, echauffement = false): SerieFaite => ({
  exerciceId: 'dc', charge, reps, faiteLe: 0, echauffement,
});
describe('surcharge progressive, série par série', () => {
  const pyramide = [s(25, 10), s(27.5, 8), s(27.5, 7)];

  it('propose un pas de plus sur la série qui a atteint le haut de la fourchette', () => {
    expect(proposerSurcharge(pyramide, 0, 10, 2.5)).toEqual({ charge: 27.5, avant: 25 });
  });

  it('ne propose rien sur les séries en dessous du haut de la fourchette', () => {
    expect(proposerSurcharge(pyramide, 1, 10, 2.5)).toBeNull();
    expect(proposerSurcharge(pyramide, 2, 10, 2.5)).toBeNull();
  });

  it('ne propose rien pour une série non faite la dernière fois', () => {
    expect(proposerSurcharge(pyramide, 3, 10, 2.5)).toBeNull();
  });

  it('ignore les séries d’échauffement', () => {
    expect(proposerSurcharge([s(30, 5, true), s(60, 10)], 0, 10, 2.5)?.charge).toBe(62.5);
  });

  it('ne propose rien au poids du corps', () => {
    expect(proposerSurcharge([s(0, 12)], 0, 10, 2.5)).toBeNull();
  });

  it('respecte le pas réglé', () => {
    expect(proposerSurcharge([s(14, 12)], 0, 12, 1)?.charge).toBe(15);
  });
});

describe('pré-remplissage d’une série', () => {
  const item: ExerciceDeSeance = {
    exerciceId: 'dc',
    prevues: [{ charge: 20, reps: 12 }, { charge: 22.5, reps: 10 }, { charge: 25, reps: 8 }],
    memeCharge: false,
    repsMin: 8,
    repsMax: 12,
    repos: 90,
    supersetAvecSuivant: false,
  };
  const derniereFois = [s(25, 10), s(27.5, 8)];

  it('reprend la MÊME série de la dernière fois, même si la série d’avant a changé aujourd’hui', () => {
    expect(proposerSerie(item, [], derniereFois)).toEqual({ charge: 25, reps: 10 });
    expect(proposerSerie(item, [s(30, 6)], derniereFois)).toEqual({ charge: 27.5, reps: 8 });
  });

  it('prend ce qui est prévu pour une série non faite la dernière fois', () => {
    expect(proposerSerie(item, [s(25, 10), s(27.5, 8)], derniereFois)).toEqual({ charge: 25, reps: 8 });
  });

  it('prend la série précédente pour une série bonus', () => {
    expect(proposerSerie(item, [s(25, 10), s(27.5, 8), s(30, 6)], derniereFois)).toEqual({ charge: 30, reps: 6 });
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
