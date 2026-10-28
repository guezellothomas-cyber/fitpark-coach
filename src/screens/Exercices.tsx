import { AVenir } from '../components/AVenir';
import { Entete } from '../components/Entete';

export function Exercices() {
  return (
    <>
      <Entete surtitre="Bibliothèque" titre="Exercices" />
      <AVenir
        etape={2}
        titre="Catalogue des exercices"
        texte="Recherche, filtres par muscle et par type, fiches détaillées et réglage « dans ma salle »."
      />
    </>
  );
}
