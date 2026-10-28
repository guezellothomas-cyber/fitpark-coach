import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { exerciceParId } from '../data/exercices';
import { useReglages } from '../db/reglages';
import type { ExerciceDeSeance } from '../db/types';
import { formatDuree } from '../lib/format';
import { Feuille } from './Feuille';
import { Reglette } from './Reglette';

interface Props {
  item: ExerciceDeSeance | null;
  onChange: (item: ExerciceDeSeance) => void;
  onRetirer: () => void;
  onFermer: () => void;
}

/** Panneau de réglage d'un exercice de la séance : séries, reps, charge de départ, repos. */
export function ReglageExercice({ item, onChange, onRetirer, onFermer }: Props) {
  const { pasCharge } = useReglages();
  const exercice = item ? exerciceParId(item.exerciceId) : undefined;
  const secondes = exercice?.mesure === 'secondes';

  return (
    <Feuille ouverte={item !== null} onFermer={onFermer} titre={exercice?.nom ?? 'Exercice'}>
      {item && (
        <>
          <div className="reglages-exercice">
            <LigneReglage libelle="Séries">
              <Reglette libelle="séries" valeur={item.series} pas={1} min={1} max={10}
                onChange={(series) => onChange({ ...item, series })} />
            </LigneReglage>
            <LigneReglage libelle={secondes ? 'Secondes mini' : 'Reps mini'}>
              <Reglette libelle={secondes ? 'secondes minimum' : 'répétitions minimum'} valeur={item.repsMin}
                pas={secondes ? 5 : 1} min={1} max={secondes ? 300 : 50} unite={secondes ? 's' : undefined}
                onChange={(repsMin) => onChange({ ...item, repsMin, repsMax: Math.max(repsMin, item.repsMax) })} />
            </LigneReglage>
            <LigneReglage libelle={secondes ? 'Secondes maxi' : 'Reps maxi'}>
              <Reglette libelle={secondes ? 'secondes maximum' : 'répétitions maximum'} valeur={item.repsMax}
                pas={secondes ? 5 : 1} min={1} max={secondes ? 300 : 50} unite={secondes ? 's' : undefined}
                onChange={(repsMax) => onChange({ ...item, repsMax, repsMin: Math.min(repsMax, item.repsMin) })} />
            </LigneReglage>
            <LigneReglage libelle="Charge de départ">
              <Reglette libelle="charge de départ" valeur={item.charge} pas={pasCharge} min={0} max={500} unite="kg"
                onChange={(charge) => onChange({ ...item, charge })} />
            </LigneReglage>
            <LigneReglage libelle="Repos">
              <Reglette libelle="temps de repos" valeur={item.repos} pas={15} min={0} max={600} formater={formatDuree}
                onChange={(repos) => onChange({ ...item, repos })} />
            </LigneReglage>
          </div>
          <div className="actions">
            <button type="button" className="bouton principal large" onClick={onFermer}>
              Terminé
            </button>
            <div className="deux-boutons">
              <Link to={`/exercices/${item.exerciceId}`} className="bouton">
                Voir la fiche
              </Link>
              <button type="button" className="bouton danger" onClick={onRetirer}>
                Retirer
              </button>
            </div>
          </div>
        </>
      )}
    </Feuille>
  );
}

function LigneReglage({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <div className="ligne-reglage">
      <span>{libelle}</span>
      {children}
    </div>
  );
}
