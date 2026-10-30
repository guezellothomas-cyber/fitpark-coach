import { describe, expect, it } from 'vitest';
import { EXERCICES, exerciceParId } from '../data/exercices';
import { JOURS_PAR_DEFAUT, REPARTITIONS, genererProgramme } from './generateur';

const ex = (id: string) => exerciceParId(id)!;

describe('générateur de programme', () => {
  it('propose une répartition pour 2 à 6 jours, avec le bon nombre de séances et de jours', () => {
    for (let n = 2; n <= 6; n++) {
      expect(REPARTITIONS[n]!.length, `${n} jours`).toBeGreaterThan(0);
      for (const r of REPARTITIONS[n]!) expect(r.seances.length, r.id).toBe(n);
      expect(JOURS_PAR_DEFAUT[n]).toHaveLength(n);
    }
  });

  it('propose Haut / Bas par défaut sur 4 jours et un mix sur 5 jours', () => {
    expect(REPARTITIONS[4]![0]!.id).toBe('haut-bas');
    expect(REPARTITIONS[5]![0]!.id).toBe('haut-bas-ppl');
  });

  it('remplit chaque séance sans doublon et couvre chaque muscle prévu', () => {
    for (let n = 2; n <= 6; n++) {
      for (const r of REPARTITIONS[n]!) {
        for (const s of genererProgramme(r, EXERCICES)) {
          const ids = s.exercices.map((e) => e.exerciceId);
          expect(new Set(ids).size, `${r.id} / ${s.nom}`).toBe(ids.length);
          const musclesCouverts = new Set(ids.map((id) => ex(id).musclePrincipal));
          for (const m of s.muscles) expect(musclesCouverts.has(m), `${r.id} / ${s.nom} : ${m}`).toBe(true);
        }
      }
    }
  });

  it('n’utilise que des exercices disponibles dans ma salle', () => {
    const absents = new Set(['developpe-couche-barre', 'squat-barre', 'tirage-vertical', 'leg-extension']);
    const catalogue = EXERCICES.map((e) => ({ ...e, disponibleDansMaSalle: !absents.has(e.id) }));
    for (const s of genererProgramme(REPARTITIONS[4]![0]!, catalogue)) {
      for (const e of s.exercices) expect(absents.has(e.exerciceId), e.exerciceId).toBe(false);
    }
  });

  it('met un polyarticulaire lourd en premier, et les isolations après', () => {
    for (const s of genererProgramme(REPARTITIONS[4]![0]!, EXERCICES)) {
      const premier = s.exercices[0]!;
      expect(ex(premier.exerciceId).mouvement.articulation, s.nom).toBe('polyarticulaire');
      expect(premier.prevues, s.nom).toHaveLength(4);
    }
  });

  it('varie les exercices entre les séances A et B', () => {
    const [hautA, , hautB] = genererProgramme(REPARTITIONS[4]![0]!, EXERCICES);
    const communs = hautA!.exercices.filter((e) => hautB!.exercices.some((f) => f.exerciceId === e.exerciceId));
    expect(communs.length).toBeLessThan(hautA!.exercices.length / 2);
  });

  it('applique le guide : après un polyarticulaire de pecs, une zone différente', () => {
    const [haut] = genererProgramme(REPARTITIONS[4]![0]!, EXERCICES);
    const pecs = haut!.exercices.map((e) => ex(e.exerciceId)).filter((e) => e.musclePrincipal === 'pectoraux');
    expect(pecs).toHaveLength(2);
    expect(pecs[0]!.zone).not.toBe(pecs[1]!.zone);
  });

  it('donne un autre choix avec une autre graine, toujours valide', () => {
    const a = genererProgramme(REPARTITIONS[3]![0]!, EXERCICES, 0);
    const b = genererProgramme(REPARTITIONS[3]![0]!, EXERCICES, 1);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
    for (const s of b) expect(s.exercices.length).toBeGreaterThan(3);
  });

  it('est stable : même entrée, même programme', () => {
    expect(genererProgramme(REPARTITIONS[5]![0]!, EXERCICES)).toEqual(genererProgramme(REPARTITIONS[5]![0]!, EXERCICES));
  });
});
