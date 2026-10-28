import { describe, expect, it } from 'vitest';
import type { SerieFaite } from '../db/types';
import { recordsBattus, unRmEstime, volume } from './records';

const s = (exerciceId: string, charge: number, reps: number, echauffement = false): SerieFaite => ({
  exerciceId, charge, reps, faiteLe: 0, echauffement,
});

describe('1RM estimé (Epley)', () => {
  it('vaut la charge pour une seule répétition', () => {
    expect(unRmEstime(100, 1)).toBe(100);
  });
  it('applique charge × (1 + reps/30)', () => {
    expect(unRmEstime(60, 8)).toBe(76);
    expect(unRmEstime(100, 10)).toBe(133.3);
  });
  it('vaut 0 au poids du corps', () => {
    expect(unRmEstime(0, 12)).toBe(0);
  });
});

describe('volume', () => {
  it('additionne charge × reps hors échauffement', () => {
    expect(volume([s('a', 60, 8), s('a', 60, 7), s('a', 30, 10, true)])).toBe(900);
  });
});

describe('records battus', () => {
  const avant = [s('dc', 60, 8), s('dc', 60, 8), s('curl', 15, 10)];

  it('détecte une charge plus lourde', () => {
    expect(recordsBattus([s('dc', 62.5, 6)], avant)).toEqual([
      { exerciceId: 'dc', type: 'charge', valeur: 62.5, ancien: 60 },
    ]);
  });

  it('détecte un meilleur 1RM estimé à charge égale', () => {
    expect(recordsBattus([s('dc', 60, 10)], avant)).toEqual([
      { exerciceId: 'dc', type: '1rm', valeur: 80, ancien: 76 },
    ]);
  });

  it('ignore un exercice jamais fait avant et l’échauffement', () => {
    expect(recordsBattus([s('squat', 100, 5), s('dc', 80, 3, true)], avant)).toEqual([]);
  });
});
