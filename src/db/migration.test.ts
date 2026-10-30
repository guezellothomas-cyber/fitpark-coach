import { describe, expect, it } from 'vitest';
import { migrerDonnees, migrerEntrainement, migrerExercice, migrerSeance } from './migration';
import { creerSauvegardeDepuis, lireSauvegarde } from './sauvegarde';
import type { ExerciceDeSeance } from './types';

const ancien = { exerciceId: 'dc', series: 3, charge: 60, repsMin: 8, repsMax: 10, repos: 90, supersetAvecSuivant: true };
const attendu: ExerciceDeSeance = {
  exerciceId: 'dc',
  prevues: [
    { charge: 60, reps: 10 },
    { charge: 60, reps: 10 },
    { charge: 60, reps: 10 },
  ],
  memeCharge: true,
  repsMin: 8,
  repsMax: 10,
  repos: 90,
  supersetAvecSuivant: true,
};

const fichier = (contenu: unknown) => new File([JSON.stringify(contenu)], 's.json', { type: 'application/json' });
const vide = { reglages: [], salle: [], mesures: [] };

describe('migration vers une charge par série', () => {
  it('répète la charge unique sur chaque série, sans rien perdre', () => {
    expect(migrerExercice(ancien)).toEqual(attendu);
  });

  it('ne touche pas à un exercice déjà au nouveau format', () => {
    const pyramide = { ...attendu, memeCharge: false, prevues: [{ charge: 25, reps: 10 }, { charge: 27.5, reps: 8 }] };
    expect(migrerExercice(pyramide)).toEqual(pyramide);
  });

  it('peut être rejouée sans effet', () => {
    expect(migrerExercice(migrerExercice(ancien))).toEqual(attendu);
  });

  it('garde les autres champs de la séance', () => {
    const s = migrerSeance({ id: 's1', nom: 'Pecs', jours: [1], muscles: ['pectoraux'], exercices: [ancien], creeLe: 1, modifieLe: 2 });
    expect(s).toEqual({ id: 's1', nom: 'Pecs', jours: [1], muscles: ['pectoraux'], exercices: [attendu], creeLe: 1, modifieLe: 2 });
  });

  it('convertit le programme d’un entraînement et garde ses séries faites à l’identique', () => {
    const series = [
      { exerciceId: 'dc', charge: 25, reps: 10, faiteLe: 1, echauffement: false },
      { exerciceId: 'dc', charge: 27.5, reps: 8, faiteLe: 2, echauffement: false },
    ];
    const e = migrerEntrainement({ id: 'e1', series, plan: [ancien] });
    expect(e.series).toEqual(series);
    expect(e.plan).toEqual([attendu]);
  });

  it('accepte un ancien entraînement sans programme', () => {
    const e = { id: 'e1', series: [], plan: undefined };
    expect(migrerEntrainement(e)).toEqual(e);
  });

  it('convertit tout le contenu d’une sauvegarde', () => {
    const d = migrerDonnees({ seances: [{ exercices: [ancien] }], entrainements: [{ plan: [ancien] }] });
    expect(d).toEqual({ seances: [{ exercices: [attendu] }], entrainements: [{ plan: [attendu] }] });
  });
});

describe('import des sauvegardes', () => {
  it('accepte l’ancien format 1 et le convertit', async () => {
    const s = await lireSauvegarde(
      fichier({ app: 'fitpark-coach', format: 1, exporteLe: '2026-10-20', donnees: { ...vide, seances: [{ id: 's', exercices: [ancien] }], entrainements: [{ id: 'e', series: [], plan: [ancien] }] } }),
    );
    expect(s.format).toBe(2);
    expect(s.donnees.seances).toEqual([{ id: 's', exercices: [attendu] }]);
    expect(s.donnees.entrainements).toEqual([{ id: 'e', series: [], plan: [attendu] }]);
  });

  it('accepte le nouveau format 2 tel quel', async () => {
    const pyramide = { ...attendu, memeCharge: false, prevues: [{ charge: 25, reps: 10 }] };
    const s = await lireSauvegarde(
      fichier({ app: 'fitpark-coach', format: 2, exporteLe: '2026-10-20', donnees: { ...vide, seances: [{ id: 's', exercices: [pyramide] }], entrainements: [] } }),
    );
    expect(s.donnees.seances).toEqual([{ id: 's', exercices: [pyramide] }]);
  });

  it('exporte au format 2', () => {
    expect(creerSauvegardeDepuis({ ...vide, seances: [], entrainements: [] }).format).toBe(2);
  });

  it('refuse un format inconnu ou un autre fichier', async () => {
    await expect(lireSauvegarde(fichier({ app: 'fitpark-coach', format: 3, donnees: {} }))).rejects.toThrow();
    await expect(lireSauvegarde(fichier({ bonjour: true }))).rejects.toThrow();
  });
});
