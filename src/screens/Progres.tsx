import { AVenir } from '../components/AVenir';
import { Entete } from '../components/Entete';

export function Progres() {
  return (
    <>
      <Entete surtitre="Suivi" titre="Progrès" />
      <AVenir
        etape={6}
        titre="Records et graphiques"
        texte="Records, 1RM estimé, courbes par exercice, carte du corps, équilibre poussée / tirage et poids de corps."
      />
    </>
  );
}
