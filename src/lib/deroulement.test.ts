import { describe, expect, it } from 'vitest';
import type { ExerciceDeSeance, SerieFaite } from '../db/types';
import { blocDe, etapeSuivante, restantes } from './deroulement';
import { creerPrevues } from './seriesPrevues';

const ex = (exerciceId: string, series = 3, supersetAvecSuivant = false, repos = 90): ExerciceDeSeance => ({
  exerciceId, prevues: creerPrevues(series, 50, 10), memeCharge: true, repsMin: 8, repsMax: 10, repos, supersetAvecSuivant,
});
const faite = (exerciceId: string, n = 1): SerieFaite[] =>
  Array.from({ length: n }, () => ({ exerciceId, charge: 50, reps: 8, faiteLe: 0, echauffement: false }));

describe('déroulement : exercices seuls', () => {
  const plan = [ex('a', 2), ex('b', 2)];

  it('reste sur le même exercice avec repos tant qu’il reste des séries', () => {
    expect(etapeSuivante(plan, faite('a', 1), 0)).toEqual({ index: 0, repos: true });
  });

  it('passe à l’exercice suivant avec repos une fois les séries faites', () => {
    expect(etapeSuivante(plan, faite('a', 2), 0)).toEqual({ index: 1, repos: true });
  });

  it('termine la séance sans repos après la toute dernière série', () => {
    expect(etapeSuivante(plan, [...faite('a', 2), ...faite('b', 2)], 1)).toEqual({ index: null, repos: false });
  });

  it('revient à un exercice sauté plus tôt', () => {
    expect(etapeSuivante(plan, faite('b', 2), 1)).toEqual({ index: 0, repos: true });
  });

  it('ne compte pas les séries d’échauffement', () => {
    const series = [{ ...faite('a')[0]!, echauffement: true }];
    expect(restantes(plan, series, 0)).toBe(2);
  });
});

describe('déroulement : supersets', () => {
  // a + b liés en superset, puis c seul
  const plan = [ex('a', 2, true), ex('b', 2), ex('c', 1)];

  it('repère le bloc lié', () => {
    expect(blocDe(plan, 0)).toEqual([0, 1]);
    expect(blocDe(plan, 1)).toEqual([0, 1]);
    expect(blocDe(plan, 2)).toEqual([2, 2]);
  });

  it('enchaîne A puis B sans repos', () => {
    expect(etapeSuivante(plan, faite('a', 1), 0)).toEqual({ index: 1, repos: false });
  });

  it('se repose après B puis revient à A', () => {
    expect(etapeSuivante(plan, [...faite('a', 1), ...faite('b', 1)], 1)).toEqual({ index: 0, repos: true });
  });

  it('passe à C une fois le superset terminé', () => {
    expect(etapeSuivante(plan, [...faite('a', 2), ...faite('b', 2)], 1)).toEqual({ index: 2, repos: true });
  });
});
