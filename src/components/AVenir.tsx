import { IconeChantier } from './Icones';

/** Encart provisoire pour une partie de l'app construite à une étape suivante. */
export function AVenir({ etape, titre, texte }: { etape: number; titre: string; texte: string }) {
  return (
    <div className="carte vide">
      <IconeChantier taille={30} />
      <span className="etiquette">Étape {etape}</span>
      <h3>{titre}</h3>
      <p>{texte}</p>
    </div>
  );
}
