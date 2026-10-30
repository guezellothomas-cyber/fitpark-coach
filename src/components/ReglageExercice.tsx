import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { exerciceParId } from '../data/exercices';
import { useReglages } from '../db/reglages';
import type { ExerciceDeSeance } from '../db/types';
import { formatDuree } from '../lib/format';
import {
  PAS_PYRAMIDE,
  appliquerPyramide,
  basculerMemeCharge,
  changerChargeCommune,
  changerChargeSerie,
  changerFourchette,
  changerNombreSeries,
  changerRepsSerie,
} from '../lib/seriesPrevues';
import { Feuille } from './Feuille';
import { Interrupteur } from './Interrupteur';
import { Reglette } from './Reglette';

interface Props {
  item: ExerciceDeSeance | null;
  onChange: (item: ExerciceDeSeance) => void;
  onRetirer: () => void;
  onFermer: () => void;
}

/** Panneau de réglage d'un exercice : séries (charge et reps de chacune), fourchette, repos. */
export function ReglageExercice({ item, onChange, onRetirer, onFermer }: Props) {
  const { pasCharge } = useReglages();
  const exercice = item ? exerciceParId(item.exerciceId) : undefined;
  const secondes = exercice?.mesure === 'secondes';
  const pasReps = secondes ? 5 : 1;
  const maxReps = secondes ? 300 : 50;

  return (
    <Feuille ouverte={item !== null} onFermer={onFermer} titre={exercice?.nom ?? 'Exercice'}>
      {item && (
        <>
          <div className="reglages-exercice">
            <LigneReglage libelle="Séries">
              <Reglette libelle="séries" valeur={item.prevues.length} pas={1} min={1} max={10}
                onChange={(n) => onChange(changerNombreSeries(item, n))} />
            </LigneReglage>
            <LigneReglage libelle="Même charge pour toutes les séries">
              <Interrupteur libelle="Même charge pour toutes les séries" actif={item.memeCharge}
                onChange={(v) => onChange(basculerMemeCharge(item, v))} />
            </LigneReglage>
            {item.memeCharge && (
              <LigneReglage libelle="Charge">
                <Reglette libelle="charge de toutes les séries" valeur={item.prevues[0]?.charge ?? 0} pas={pasCharge} min={0} max={500}
                  unite="kg" onChange={(c) => onChange(changerChargeCommune(item, c))} />
              </LigneReglage>
            )}
          </div>

          <div className="series-prevues" role="group" aria-label="Détail des séries">
            <div className="serie-prevue entete-series" aria-hidden="true">
              <span />
              <span>Charge (kg)</span>
              <span>{secondes ? 'Secondes' : 'Reps'}</span>
            </div>
            {item.prevues.map((p, i) => (
              <div key={i} className="serie-prevue">
                <span className="serie-numero chiffres">{i + 1}</span>
                <Reglette compacte libelle={`charge de la série ${i + 1}`} valeur={p.charge} pas={pasCharge} min={0} max={500}
                  onChange={(c) => onChange(changerChargeSerie(item, i, c))} />
                <Reglette compacte libelle={`objectif de la série ${i + 1}`} valeur={p.reps} pas={pasReps} min={1} max={maxReps}
                  onChange={(r) => onChange(changerRepsSerie(item, i, r))} />
              </div>
            ))}
          </div>

          <Pyramide item={item} pasCharge={pasCharge} onChange={onChange} />

          <div className="reglages-exercice">
            <LigneReglage libelle={secondes ? 'Secondes mini' : 'Reps mini'}>
              <Reglette libelle={secondes ? 'secondes minimum' : 'répétitions minimum'} valeur={item.repsMin}
                pas={pasReps} min={1} max={maxReps} unite={secondes ? 's' : undefined}
                onChange={(repsMin) => onChange(changerFourchette(item, repsMin, Math.max(repsMin, item.repsMax)))} />
            </LigneReglage>
            <LigneReglage libelle={secondes ? 'Secondes maxi' : 'Reps maxi'}>
              <Reglette libelle={secondes ? 'secondes maximum' : 'répétitions maximum'} valeur={item.repsMax}
                pas={pasReps} min={1} max={maxReps} unite={secondes ? 's' : undefined}
                onChange={(repsMax) => onChange(changerFourchette(item, Math.min(repsMax, item.repsMin), repsMax))} />
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

/** Raccourci "Pyramide" : charge de la série 1 + un pas, l'app remplit les suivantes. */
function Pyramide({
  item,
  pasCharge,
  onChange,
}: {
  item: ExerciceDeSeance;
  pasCharge: number;
  onChange: (item: ExerciceDeSeance) => void;
}) {
  const [ouverte, setOuverte] = useState(false);
  const [depart, setDepart] = useState(item.prevues[0]?.charge ?? 0);
  const [pas, setPas] = useState(PAS_PYRAMIDE);

  if (!ouverte) {
    return (
      <button type="button" className="bouton large bouton-pyramide" disabled={item.prevues.length < 2}
        onClick={() => {
          setDepart(item.prevues[0]?.charge ?? 0);
          setOuverte(true);
        }}>
        Pyramide
      </button>
    );
  }
  return (
    <div className="carte pyramide">
      <div className="reglages-exercice">
        <LigneReglage libelle="Charge série 1">
          <Reglette libelle="charge de la série 1" valeur={depart} pas={pasCharge} min={0} max={500} unite="kg" onChange={setDepart} />
        </LigneReglage>
        <LigneReglage libelle="Pas par série">
          <Reglette libelle="pas de la pyramide" valeur={pas} pas={0.5} min={0.5} max={20} unite="kg" onChange={setPas} />
        </LigneReglage>
      </div>
      <div className="deux-boutons">
        <button type="button" className="bouton" onClick={() => setOuverte(false)}>
          Annuler
        </button>
        <button type="button" className="bouton principal"
          onClick={() => {
            onChange(appliquerPyramide(item, depart, pas));
            setOuverte(false);
          }}>
          Appliquer
        </button>
      </div>
    </div>
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
