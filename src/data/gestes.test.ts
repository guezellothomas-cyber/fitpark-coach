import { describe, expect, it } from 'vitest';
import { SEGMENTS, completer, interpoler, longueur, progression } from '../lib/cinematique';
import { EXERCICES } from './exercices';
import { GESTES, MOTIFS, type Motif } from './gestes';

describe('gestes animés', () => {
  it('donne un geste à chaque exercice du catalogue', () => {
    for (const e of EXERCICES) expect(GESTES[e.id], e.id).toBeDefined();
  });

  it('ne référence que des exercices et des motifs existants', () => {
    const ids = new Set(EXERCICES.map((e) => e.id));
    for (const [id, geste] of Object.entries(GESTES)) {
      expect(ids.has(id), id).toBe(true);
      expect(MOTIFS[geste.motif], `${id} → ${geste.motif}`).toBeDefined();
    }
  });

  it('a un point d’attache pour chaque geste à la poulie', () => {
    for (const [id, geste] of Object.entries(GESTES)) {
      if (geste.materiel === 'poulie' || geste.materiel === 'poulie-cheville') {
        expect((MOTIFS[geste.motif] as Motif).ancre, id).toBeDefined();
      }
    }
  });

  // Un membre ne doit pas changer de longueur entre le départ et l'arrivée :
  // c'est ce qui détecte une faute de frappe dans les coordonnées.
  it('garde des membres de longueur constante entre les deux poses', () => {
    for (const [nom, m] of Object.entries(MOTIFS) as [string, Motif][]) {
      const A = completer(m.A, m.vue);
      const B = completer(m.B, m.vue);
      for (const [enfant, parent] of SEGMENTS) {
        const la = longueur(A, enfant, parent);
        const lb = longueur(B, enfant, parent);
        const ecart = Math.abs(la - lb) / Math.max(la, lb, 1);
        expect(ecart, `${nom} : segment ${parent}→${enfant} (${la.toFixed(1)} / ${lb.toFixed(1)})`).toBeLessThan(0.3);
      }
    }
  });

  it('a des proportions humaines vues de profil', () => {
    for (const [nom, m] of Object.entries(MOTIFS) as [string, Motif][]) {
      if (m.vue !== 'profil') continue;
      for (const pose of [m.A, m.B]) {
        const p = completer(pose, 'profil');
        const tronc = longueur(p, 'S', 'H');
        expect(tronc, `${nom} : tronc`).toBeGreaterThan(24);
        expect(tronc, `${nom} : tronc`).toBeLessThan(38);
        expect(longueur(p, 'E', 'S'), `${nom} : bras`).toBeGreaterThan(11);
        expect(longueur(p, 'M', 'E'), `${nom} : avant-bras`).toBeGreaterThan(9);
        expect(longueur(p, 'G', 'H'), `${nom} : cuisse`).toBeGreaterThan(17);
        expect(longueur(p, 'C', 'G'), `${nom} : jambe`).toBeGreaterThan(17);
      }
    }
  });
});

describe('moteur d’animation', () => {
  const m = MOTIFS.curl as Motif;
  const A = completer(m.A, m.vue);
  const B = completer(m.B, m.vue);

  it('retrouve exactement les poses de départ et d’arrivée', () => {
    const debut = interpoler(A, B, 0);
    const fin = interpoler(A, B, 1);
    expect(debut.M[0]).toBeCloseTo(A.M[0]);
    expect(fin.M[1]).toBeCloseTo(B.M[1]);
  });

  it('garde la longueur de l’avant-bras pendant le mouvement', () => {
    const milieu = interpoler(A, B, 0.5);
    expect(longueur(milieu, 'M', 'E')).toBeCloseTo((longueur(A, 'M', 'E') + longueur(B, 'M', 'E')) / 2, 1);
  });

  it('va de 0 à 1 puis revient à 0 sur un cycle', () => {
    expect(progression(0)).toBe(0);
    expect(progression(1500)).toBe(1);
    expect(progression(3300)).toBe(0);
  });
});
