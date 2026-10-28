import { definirDisponible } from '../db/salle';
import { IconeCoche } from './Icones';

/** Rond à cocher : l'exercice est-il faisable dans ma salle ? */
export function CaseSalle({ exerciceId, nom, disponible }: { exerciceId: string; nom: string; disponible: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={disponible}
      aria-label={`${nom} : disponible dans ma salle`}
      className="case-salle"
      onClick={() => void definirDisponible(exerciceId, !disponible)}
    >
      <span className="case-salle-rond">
        <IconeCoche taille={20} strokeWidth={2.6} />
      </span>
    </button>
  );
}
