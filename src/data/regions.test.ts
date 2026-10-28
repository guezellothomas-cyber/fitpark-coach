import { describe, expect, it } from 'vitest';
import { EXERCICES, exerciceParId } from './exercices';
import { meilleurCadrage, meilleureVue, regionsExercice } from './regions';

const carte = (id: string) => regionsExercice(exerciceParId(id)!);

describe('silhouette des exercices', () => {
  it('colorie au moins une zone en rouge vif pour chaque exercice', () => {
    for (const e of EXERCICES) {
      expect(Object.values(regionsExercice(e)), e.id).toContain('fort');
    }
  });

  it('met le muscle principal en vif et les secondaires en clair', () => {
    const c = carte('developpe-couche-barre');
    expect(c['pec-haut']).toBe('fort');
    expect(c['pec-bas']).toBe('fort');
    expect(c.triceps).toBe('leger');
    expect(c['delt-avant']).toBe('leger');
    expect(c.biceps).toBeUndefined();
  });

  it('affine selon la zone : développé incliné = haut des pecs', () => {
    const c = carte('developpe-incline-halteres');
    expect(c['pec-haut']).toBe('fort');
    expect(c['pec-bas']).toBe('leger');
  });

  it('affine selon la zone : oiseau = épaule arrière, vue de dos', () => {
    const c = carte('oiseau-halteres');
    expect(c['delt-arriere']).toBe('fort');
    expect(c['delt-avant']).toBe('leger');
    expect(meilleureVue(c)).toBe('dos');
  });

  it('cadre les miniatures sur les jambes ou sur le haut du corps', () => {
    expect(meilleurCadrage(carte('leg-extension'))).toBe('bas');
    expect(meilleurCadrage(carte('developpe-couche-barre'))).toBe('haut');
  });

  it('choisit la vue de face pour les pecs et de dos pour les ischios', () => {
    expect(meilleureVue(carte('butterfly'))).toBe('face');
    expect(meilleureVue(carte('leg-curl-assis'))).toBe('dos');
  });
});
