import { describe, expect, it } from 'vitest';
import { resumerSeries } from './perf';

describe('resumerSeries', () => {
  it('regroupe les séries à la même charge', () => {
    const s = [8, 8, 7].map((reps) => ({ charge: 60, reps }));
    expect(resumerSeries(s)).toBe('60 kg × 8, 8, 7');
  });

  it('détaille chaque série quand les charges diffèrent', () => {
    expect(
      resumerSeries([
        { charge: 25, reps: 10 },
        { charge: 27.5, reps: 8 },
        { charge: 27.5, reps: 7 },
      ]),
    ).toBe('25 kg × 10, 27,5 kg × 8, 27,5 kg × 7');
  });

  it('affiche seulement les reps au poids du corps', () => {
    expect(resumerSeries([{ charge: 0, reps: 12 }, { charge: 0, reps: 10 }])).toBe('12, 10 reps');
  });

  it('affiche des secondes pour le gainage', () => {
    expect(resumerSeries([{ charge: 0, reps: 45 }, { charge: 0, reps: 40 }], true)).toBe('45, 40 s');
    expect(resumerSeries([{ charge: 10, reps: 30 }], true)).toBe('10 kg × 30 s');
  });

  it('renvoie une chaîne vide sans série', () => {
    expect(resumerSeries([])).toBe('');
  });
});
