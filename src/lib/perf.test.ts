import { describe, expect, it } from 'vitest';
import { resumerSeries } from './perf';

describe('resumerSeries', () => {
  it('regroupe les séries à la même charge', () => {
    const s = [8, 8, 7].map((reps) => ({ charge: 60, reps }));
    expect(resumerSeries(s)).toBe('60 kg × 8, 8, 7');
  });

  it('sépare les charges différentes', () => {
    expect(
      resumerSeries([
        { charge: 60, reps: 8 },
        { charge: 62.5, reps: 6 },
        { charge: 62.5, reps: 5 },
      ]),
    ).toBe('60 kg × 8 · 62,5 kg × 6, 5');
  });

  it('affiche seulement les reps au poids du corps', () => {
    expect(resumerSeries([{ charge: 0, reps: 12 }, { charge: 0, reps: 10 }])).toBe('12, 10 reps');
  });

  it('renvoie une chaîne vide sans série', () => {
    expect(resumerSeries([])).toBe('');
  });
});
