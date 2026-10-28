import { describe, expect, it } from 'vitest';
import { urlRaccourci } from './raccourci';

describe('URL du raccourci iOS', () => {
  it('suit le format demandé', () => {
    expect(urlRaccourci(90)).toBe('shortcuts://run-shortcut?name=Repos%20FitPark&input=text&text=90');
  });

  it('arrondit les secondes', () => {
    expect(urlRaccourci(74.6)).toContain('text=75');
  });

  it('ajoute le retour automatique (x-success) encodé', () => {
    const url = urlRaccourci(60, 'https://exemple.github.io/fitpark-coach/#/seance');
    expect(url).toBe(
      'shortcuts://x-callback-url/run-shortcut?name=Repos%20FitPark&input=text&text=60' +
        '&x-success=https%3A%2F%2Fexemple.github.io%2Ffitpark-coach%2F%23%2Fseance',
    );
  });
});
