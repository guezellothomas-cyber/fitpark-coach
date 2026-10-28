import { AVenir } from '../components/AVenir';
import { Entete } from '../components/Entete';

export function Seances() {
  return (
    <>
      <Entete surtitre="Mes programmes" titre="Séances" />
      <AVenir
        etape={3}
        titre="Création de séances"
        texte="Nom, jours, muscles ciblés, exercices dans l'ordre, supersets et suggestions du guide."
      />
    </>
  );
}
