/**
 * Recherche tolérante : sans accents, sans majuscules, mots dans n'importe quel ordre.
 * "dev incl" trouve "Développé incliné haltères".
 */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ');
}

export function correspond(texte: string, recherche: string): boolean {
  const cible = normaliser(texte);
  return normaliser(recherche)
    .split(/\s+/)
    .filter(Boolean)
    .every((mot) => cible.includes(mot));
}
