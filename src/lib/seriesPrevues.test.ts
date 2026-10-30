import { describe, expect, it } from 'vitest';
import type { ExerciceDeSeance } from '../db/types';
import {
  appliquerPyramide,
  basculerMemeCharge,
  changerChargeCommune,
  changerChargeSerie,
  changerFourchette,
  changerNombreSeries,
  changerRepsSerie,
  creerPrevues,
  resumerCharges,
} from './seriesPrevues';

const base: ExerciceDeSeance = {
  exerciceId: 'extension-poulie-haute',
  prevues: creerPrevues(3, 25, 10),
  memeCharge: true,
  repsMin: 8,
  repsMax: 10,
  repos: 90,
  supersetAvecSuivant: false,
};
const charges = (e: ExerciceDeSeance) => e.prevues.map((p) => p.charge);

describe('séries prévues', () => {
  it('désactive "même charge" dès qu’une seule série change', () => {
    const e = changerChargeSerie(base, 1, 27.5);
    expect(charges(e)).toEqual([25, 27.5, 25]);
    expect(e.memeCharge).toBe(false);
  });

  it('laisse "même charge" actif si la valeur ne change pas', () => {
    expect(changerChargeSerie(base, 1, 25).memeCharge).toBe(true);
  });

  it('réaligne toutes les séries sur la série 1 quand on réactive "même charge"', () => {
    const e = basculerMemeCharge(changerChargeSerie(base, 1, 30), true);
    expect(charges(e)).toEqual([25, 25, 25]);
    expect(e.memeCharge).toBe(true);
  });

  it('garde les charges de chaque série quand on désactive "même charge"', () => {
    const e = basculerMemeCharge(base, false);
    expect(charges(e)).toEqual([25, 25, 25]);
    expect(e.memeCharge).toBe(false);
  });

  it('applique une charge commune à toutes les séries', () => {
    expect(charges(changerChargeCommune(base, 40))).toEqual([40, 40, 40]);
  });

  it('remplit une pyramide depuis la série 1', () => {
    const e = appliquerPyramide(base, 25, 2.5);
    expect(charges(e)).toEqual([25, 27.5, 30]);
    expect(e.memeCharge).toBe(false);
  });

  it('change les reps d’une seule série', () => {
    expect(changerRepsSerie(base, 2, 7).prevues.map((p) => p.reps)).toEqual([10, 10, 7]);
  });

  it('recopie la dernière série quand on en ajoute, et garde les premières quand on en retire', () => {
    const e = appliquerPyramide(base, 25, 2.5);
    expect(charges(changerNombreSeries(e, 4))).toEqual([25, 27.5, 30, 30]);
    expect(charges(changerNombreSeries(e, 2))).toEqual([25, 27.5]);
  });

  it('garde les objectifs dans la fourchette quand elle change', () => {
    const e = changerRepsSerie(base, 2, 8);
    expect(changerFourchette(e, 10, 12).prevues.map((p) => p.reps)).toEqual([12, 12, 10]);
  });

  it('résume les charges', () => {
    expect(resumerCharges(base.prevues)).toBe('25 kg');
    expect(resumerCharges(appliquerPyramide(base, 25, 2.5).prevues)).toBe('25 / 27,5 / 30 kg');
    expect(resumerCharges(creerPrevues(3, 0, 10))).toBe('');
  });
});
