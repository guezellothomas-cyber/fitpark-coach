import { describe, expect, it } from 'vitest';
import { EXERCICES, exerciceParId } from '../data/exercices';
import { equivalents } from './remplacement';

const ex = (id: string) => exerciceParId(id)!;

describe('remplacement (machine prise)', () => {
  it('propose le même muscle et la même zone', () => {
    const r = equivalents(ex('presse-cuisses'), EXERCICES);
    expect(r.length).toBeGreaterThan(0);
    for (const e of r) {
      expect(e.exercice.musclePrincipal).toBe('quadriceps');
      expect(e.exercice.zone).toBe('vastes');
    }
  });

  it('met en tête un exercice du même type de mouvement', () => {
    const premier = equivalents(ex('developpe-couche-barre'), EXERCICES)[0]!.exercice;
    expect(premier.mouvement.articulation).toBe('polyarticulaire');
    expect(premier.zone).toBe('milieu');
  });

  it('ne propose jamais un exercice absent de ma salle, ni l’exercice lui-même, ni un exclu', () => {
    const catalogue = EXERCICES.map((e) => ({ ...e, disponibleDansMaSalle: e.id !== 'hack-squat' }));
    const ids = equivalents(ex('presse-cuisses'), catalogue, new Set(['squat-barre'])).map((e) => e.exercice.id);
    expect(ids).not.toContain('hack-squat');
    expect(ids).not.toContain('presse-cuisses');
    expect(ids).not.toContain('squat-barre');
  });

  it('se rabat sur le même muscle quand la zone n’a pas d’autre exercice', () => {
    // Leg extension est le seul exercice "droit fémoral"
    const r = equivalents(ex('leg-extension'), EXERCICES);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((e) => e.exercice.musclePrincipal === 'quadriceps' && !e.memeZone)).toBe(true);
  });
});
