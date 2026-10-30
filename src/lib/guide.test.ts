import { describe, expect, it } from 'vitest';
import { EXERCICES, exerciceParId } from '../data/exercices';
import { estQuasiDoublon, suggerer } from './guide';

const ex = (id: string) => {
  const e = exerciceParId(id);
  if (!e) throw new Error(`Exercice inconnu : ${id}`);
  return e;
};

/** Noms des suggestions pour un premier exercice, avec tout le catalogue disponible. */
const noms = (id: string) => suggerer(ex(id), EXERCICES).map((s) => s.exercice.nom);

describe('guide : exemples du cahier des charges', () => {
  it('Développé couché barre → incliné haltères + écarté vis-à-vis poulie', () => {
    expect(noms('developpe-couche-barre')).toEqual([
      'Développé incliné haltères',
      'Écarté vis-à-vis poulie haute',
    ]);
  });

  it('Tirage vertical → tirage horizontal poulie basse + pull-over poulie bras tendus', () => {
    expect(noms('tirage-vertical')).toEqual([
      'Tirage horizontal poulie basse',
      'Pull-over poulie bras tendus',
    ]);
  });

  it('Extension poulie haute → extension corde au-dessus de la tête + dips', () => {
    expect(noms('extension-poulie-haute')).toEqual([
      'Extension corde au-dessus de la tête',
      'Dips (buste droit)',
    ]);
  });

  it('Curl barre → curl incliné haltères + curl marteau', () => {
    expect(noms('curl-barre')).toEqual(['Curl incliné haltères', 'Curl marteau']);
  });

  it('Presse à cuisses → leg extension + leg curl assis', () => {
    expect(noms('presse-cuisses')).toEqual(['Leg extension', 'Leg curl assis']);
  });
});

describe('guide : avant-bras', () => {
  it('Curl poignets barre → extension poignets haltères + curl inversé barre EZ', () => {
    expect(noms('curl-poignets')).toEqual(['Extension poignets haltères', 'Curl inversé barre EZ']);
  });

  it('les extenseurs appellent les fléchisseurs', () => {
    expect(suggerer(ex('extension-poignets-halteres'), EXERCICES)[0]!.exercice.zone).toBe('flechisseurs');
  });

  it('les fléchisseurs à la poulie appellent aussi les extenseurs', () => {
    expect(suggerer(ex('curl-poignets-poulie'), EXERCICES)[0]!.exercice.zone).toBe('extenseurs');
  });

  it('une fois les extenseurs dans la séance, propose une autre zone', () => {
    const zones = suggerer(ex('curl-poignets'), EXERCICES, [ex('extension-poignets-halteres')]).map((s) => s.exercice.zone);
    expect(zones[0]).toBe('brachio-radial');
  });
});

describe('guide : filtres', () => {
  it('ne propose jamais un exercice absent de ma salle', () => {
    const catalogue = EXERCICES.map((e) => ({
      ...e,
      disponibleDansMaSalle: e.id !== 'developpe-incline-halteres',
    }));
    const ids = suggerer(ex('developpe-couche-barre'), catalogue).map((s) => s.exercice.id);
    expect(ids).not.toContain('developpe-incline-halteres');
    expect(ids).toHaveLength(2);
  });

  it('ne propose jamais un quasi-doublon d’un exercice déjà choisi', () => {
    for (const depart of EXERCICES) {
      const suggestions = suggerer(depart, EXERCICES);
      for (const s of suggestions) {
        expect(estQuasiDoublon(s.exercice, depart), `${depart.id} → ${s.exercice.id}`).toBe(false);
        expect(s.exercice.id).not.toBe(depart.id);
      }
      if (suggestions.length === 2) {
        expect(estQuasiDoublon(suggestions[0]!.exercice, suggestions[1]!.exercice)).toBe(false);
      }
    }
  });

  it('tient compte des exercices déjà présents dans la séance', () => {
    const deja = [ex('developpe-incline-halteres')];
    const ids = suggerer(ex('developpe-couche-barre'), EXERCICES, deja).map((s) => s.exercice.id);
    expect(ids).not.toContain('developpe-incline-halteres');
  });

  it('donne une raison en une ligne pour chaque suggestion', () => {
    for (const s of suggerer(ex('developpe-couche-barre'), EXERCICES)) {
      expect(s.raison.length).toBeGreaterThan(5);
      expect(s.raison).not.toContain('\n');
    }
  });

  it('reste dans le muscle choisi (sauf cuisses : quadriceps et ischios)', () => {
    for (const s of suggerer(ex('curl-barre'), EXERCICES)) expect(s.exercice.musclePrincipal).toBe('biceps');
  });
});
