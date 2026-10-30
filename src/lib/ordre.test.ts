import { describe, expect, it } from 'vitest';
import type { ExerciceDeSeance } from '../db/types';
import { inserer, ordonner } from './ordre';
import { creerPrevues } from './seriesPrevues';

const item = (exerciceId: string, supersetAvecSuivant = false): ExerciceDeSeance => ({
  exerciceId,
  prevues: creerPrevues(3, 0, 10),
  memeCharge: true,
  repsMin: 8,
  repsMax: 10,
  repos: 90,
  supersetAvecSuivant,
});
const ids = (l: ExerciceDeSeance[]) => l.map((e) => e.exerciceId);

describe('ordre conseillé', () => {
  it('met les polyarticulaires avant les isolations, et pecs avant triceps', () => {
    const melange = [
      item('extension-poulie-haute'),
      item('ecarte-poulie-haute'),
      item('dips'),
      item('developpe-couche-barre'),
      item('presse-inclinee'),
    ];
    expect(ids(ordonner(melange, ['pectoraux', 'triceps']))).toEqual([
      'developpe-couche-barre', // pecs, poly, libre
      'presse-inclinee', // pecs, poly, machine
      'ecarte-poulie-haute', // pecs, isolation
      'dips', // triceps, poly
      'extension-poulie-haute', // triceps, isolation
    ]);
  });

  it('garde les supersets ensemble', () => {
    const l = [item('curl-barre', true), item('extension-poulie-haute'), item('developpe-couche-barre')];
    const r = ordonner(l, ['pectoraux', 'biceps', 'triceps']);
    expect(ids(r)).toEqual(['developpe-couche-barre', 'curl-barre', 'extension-poulie-haute']);
    expect(r[1]!.supersetAvecSuivant).toBe(true);
  });

  it('insère un nouvel exercice à sa place sans déplacer les autres', () => {
    const l = [item('developpe-couche-barre'), item('ecarte-poulie-haute'), item('extension-poulie-haute')];
    const r = inserer(l, item('developpe-incline-halteres'), ['pectoraux', 'triceps']);
    expect(ids(r)).toEqual([
      'developpe-couche-barre',
      'developpe-incline-halteres',
      'ecarte-poulie-haute',
      'extension-poulie-haute',
    ]);
  });

  it('n’insère jamais au milieu d’un superset', () => {
    const l = [item('developpe-couche-barre', true), item('rowing-barre'), item('curl-barre')];
    const r = inserer(l, item('developpe-incline-halteres'), ['pectoraux', 'dos', 'biceps']);
    expect(ids(r)).toEqual(['developpe-couche-barre', 'rowing-barre', 'developpe-incline-halteres', 'curl-barre']);
  });
});
