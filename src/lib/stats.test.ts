import { describe, expect, it } from 'vitest';
import type { Entrainement, SerieFaite } from '../db/types';
import { carteSemaine, debutSemaine, equilibre, progressionExercice, recordsParExercice, seriesParMuscle } from './stats';

const s = (exerciceId: string, charge = 50, reps = 10, echauffement = false): SerieFaite => ({
  exerciceId, charge, reps, faiteLe: 0, echauffement,
});
const fois = (n: number, serie: SerieFaite) => Array.from({ length: n }, () => serie);
const entr = (debut: number, series: SerieFaite[]): Entrainement => ({
  id: String(debut), seanceId: null, nom: 'test', debut, fin: debut + 1, series,
});

describe('semaine', () => {
  it('commence le lundi à 0 h', () => {
    const lundi = debutSemaine(new Date(2026, 9, 28, 18, 30)); // mercredi 28 octobre
    expect(new Date(lundi)).toEqual(new Date(2026, 9, 26, 0, 0, 0, 0));
  });

  it('rattache le dimanche à la semaine qui se termine', () => {
    expect(new Date(debutSemaine(new Date(2026, 10, 1)))).toEqual(new Date(2026, 9, 26));
  });
});

describe('séries par muscle', () => {
  it('compte 1 pour le principal et 0,5 pour les secondaires, hors échauffement', () => {
    const r = seriesParMuscle([s('developpe-couche-barre'), s('developpe-couche-barre'), s('developpe-couche-barre', 20, 10, true)]);
    expect(r.pectoraux).toBe(2);
    expect(r.triceps).toBe(1);
    expect(r.epaules).toBe(1);
    expect(r.dos).toBe(0);
  });

  it('colorie la carte du corps par paliers', () => {
    const r = seriesParMuscle([...fois(10, s('developpe-couche-barre')), ...fois(3, s('curl-barre'))]);
    const carte = carteSemaine(r);
    expect(carte['pec-haut']).toBe('fort'); // 10 séries
    expect(carte.triceps).toBe('moyen'); // 5 séries (secondaire)
    expect(carte.biceps).toBe('leger'); // 3 séries
    expect(carte.ischios).toBeUndefined();
  });
});

describe('équilibre poussée / tirage', () => {
  it('ne juge pas en dessous de 10 séries', () => {
    expect(equilibre(fois(8, s('developpe-couche-barre'))).alerte).toBeNull();
  });

  it('alerte quand la poussée domine nettement', () => {
    const e = equilibre([...fois(12, s('developpe-couche-barre')), ...fois(4, s('rowing-barre'))]);
    expect(e).toEqual({ poussee: 12, tirage: 4, alerte: 'poussee' });
  });

  it('accepte un écart modéré', () => {
    expect(equilibre([...fois(9, s('developpe-couche-barre')), ...fois(7, s('rowing-barre'))]).alerte).toBeNull();
  });

  it('ignore les exercices neutres (abdos)', () => {
    expect(equilibre(fois(12, s('crunch-sol', 0, 20))).poussee).toBe(0);
  });
});

describe('progression et records', () => {
  const historique = [
    entr(2000, [s('dc', 60, 8), s('dc', 62.5, 6), s('dc', 30, 10, true)]),
    entr(1000, [s('dc', 60, 10), s('curl', 15, 12)]),
  ];

  it('donne un point par séance, dans l’ordre chronologique', () => {
    const p = progressionExercice(historique, 'dc');
    expect(p.map((x) => x.date)).toEqual([1000, 2000]);
    expect(p[1]).toMatchObject({ chargeMax: 62.5, volume: 60 * 8 + 62.5 * 6 });
  });

  it('compte chaque série à sa propre charge sur une pyramide', () => {
    const [p] = progressionExercice([entr(1, [s('ext', 25, 10), s('ext', 27.5, 8), s('ext', 27.5, 7)])], 'ext');
    expect(p).toMatchObject({ chargeMax: 27.5, volume: 25 * 10 + 27.5 * 8 + 27.5 * 7, unRm: 34.8 });
  });

  it('retient la série la plus lourde et le meilleur 1RM estimé', () => {
    const dc = recordsParExercice(historique).find((r) => r.exerciceId === 'dc')!;
    expect(dc.meilleure).toEqual({ charge: 62.5, reps: 6, date: 2000 });
    expect(dc.unRm).toBe(80); // 60 × (1 + 10/30)
    expect(dc.nbSeances).toBe(2);
  });
});
