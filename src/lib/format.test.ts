import { describe, expect, it } from 'vitest';
import { formatDuree, formatNombre, jourSemaine } from './format';

describe('formats', () => {
  it('affiche les nombres à la française', () => {
    expect(formatNombre(2.5)).toBe('2,5');
    expect(formatNombre(60)).toBe('60');
  });

  it('affiche une durée en minutes:secondes', () => {
    expect(formatDuree(90)).toBe('1:30');
    expect(formatDuree(45)).toBe('0:45');
    expect(formatDuree(-3)).toBe('0:00');
  });

  it('numérote les jours de 1 (lundi) à 7 (dimanche)', () => {
    expect(jourSemaine(new Date(2026, 9, 26))).toBe(1); // lundi 26 octobre 2026
    expect(jourSemaine(new Date(2026, 10, 1))).toBe(7); // dimanche 1er novembre 2026
  });
});
