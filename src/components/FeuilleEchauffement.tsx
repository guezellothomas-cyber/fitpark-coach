import { useState } from 'react';
import { formatNombre } from '../lib/format';
import { seriesEchauffement } from '../lib/progression';
import { Feuille } from './Feuille';
import { IconeCoche } from './Icones';

interface Props {
  ouverte: boolean;
  chargeTravail: number;
  pas: number;
  onFaite: (charge: number, reps: number) => void;
  onFermer: () => void;
}

/** Séries d'approche calculées à partir de la charge de travail, à cocher une par une. */
export function FeuilleEchauffement({ ouverte, chargeTravail, pas, onFaite, onFermer }: Props) {
  const [faites, setFaites] = useState<Set<number>>(new Set());
  const series = seriesEchauffement(chargeTravail, pas);

  return (
    <Feuille ouverte={ouverte} onFermer={onFermer} titre="Échauffement">
      <p>
        Pour une charge de travail de <strong>{formatNombre(chargeTravail)} kg</strong>. Ces séries ne comptent pas dans
        tes statistiques.
      </p>
      <ol className="carte echauffement">
        {series.map((s, i) => (
          <li key={i} className="ligne">
            <div className="libelle">
              <span className="chiffres echauffement-perf">
                {formatNombre(s.charge)} kg × {s.reps}
              </span>
              <small>{s.pourcentage} % de la charge de travail</small>
            </div>
            <button
              type="button"
              className={`bouton${faites.has(i) ? ' fait' : ''}`}
              disabled={faites.has(i)}
              onClick={() => {
                onFaite(s.charge, s.reps);
                setFaites(new Set(faites).add(i));
              }}
            >
              {faites.has(i) ? <IconeCoche taille={20} strokeWidth={3} /> : 'Fait'}
            </button>
          </li>
        ))}
      </ol>
      <div className="actions">
        <button type="button" className="bouton principal large" onClick={onFermer}>
          Passer aux séries de travail
        </button>
      </div>
    </Feuille>
  );
}
