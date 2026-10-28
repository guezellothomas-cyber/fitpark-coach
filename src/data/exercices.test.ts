import { describe, expect, it } from 'vitest';
import { EXERCICES } from './exercices';
import { MUSCLES, ZONES, type MuscleId } from './muscles';

/** Vérifie que le catalogue est cohérent (pas de doublon, zones valides, consignes présentes). */
describe('catalogue des exercices', () => {
  const muscles = new Set<string>(MUSCLES.map((m) => m.id));

  it('a des identifiants uniques et des noms uniques', () => {
    const ids = EXERCICES.map((e) => e.id);
    const noms = EXERCICES.map((e) => e.nom.toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(noms).size).toBe(noms.length);
  });

  it('utilise des identifiants simples (minuscules, chiffres, tirets)', () => {
    for (const e of EXERCICES) expect(e.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('donne 2 ou 3 consignes non vides à chaque exercice', () => {
    for (const e of EXERCICES) {
      expect(e.consignes.length, e.id).toBeGreaterThanOrEqual(2);
      expect(e.consignes.length, e.id).toBeLessThanOrEqual(3);
      for (const c of e.consignes) expect(c.trim().length, e.id).toBeGreaterThan(5);
    }
  });

  it('utilise des muscles et des zones qui existent', () => {
    for (const e of EXERCICES) {
      expect(muscles.has(e.musclePrincipal), e.id).toBe(true);
      expect(Object.keys(ZONES[e.musclePrincipal]), e.id).toContain(e.zone);
      for (const m of e.musclesSecondaires) {
        expect(muscles.has(m), `${e.id} : ${m}`).toBe(true);
        expect(m, `${e.id} : secondaire = principal`).not.toBe(e.musclePrincipal);
      }
    }
  });

  it('couvre chaque muscle travaillé avec au moins 2 exercices', () => {
    const principaux = MUSCLES.map((m) => m.id).filter((m) => m !== 'avant-bras');
    for (const m of principaux) {
      const n = EXERCICES.filter((e) => e.musclePrincipal === (m as MuscleId)).length;
      expect(n, m).toBeGreaterThanOrEqual(2);
    }
  });

  it('contient les exercices de la liste de départ', () => {
    const attendus = [
      'developpe-couche-barre', 'developpe-incline-halteres', 'ecarte-poulie-haute',
      'tirage-vertical', 'tirage-horizontal-poulie', 'pull-over-poulie',
      'extension-poulie-haute', 'extension-corde-tete', 'dips',
      'curl-barre', 'curl-incline', 'curl-marteau',
      'presse-cuisses', 'leg-extension', 'leg-curl-assis',
    ];
    const ids = new Set(EXERCICES.map((e) => e.id));
    for (const id of attendus) expect(ids.has(id), id).toBe(true);
  });
});
