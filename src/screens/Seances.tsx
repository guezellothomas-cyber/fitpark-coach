import { useNavigate } from 'react-router-dom';
import { Entete } from '../components/Entete';
import { IconeGuide, IconePlus, IconeSeances } from '../components/Icones';
import { creerSeance, nomSeance, useSeances } from '../db/seances';
import { JOURS_COURTS, jourSemaine } from '../lib/format';
import { libelleMuscle } from '../data/muscles';

/** Liste de mes séances types, avec le bouton pour en créer une nouvelle. */
export function Seances() {
  const seances = useSeances();
  const naviguer = useNavigate();
  const aujourdhui = jourSemaine(new Date());

  async function nouvelle() {
    const id = await creerSeance();
    naviguer(`/seances/${id}`);
  }

  return (
    <>
      <Entete surtitre="Mes programmes" titre="Séances" />

      {seances && seances.length === 0 && (
        <div className="carte vide">
          <IconeSeances taille={30} />
          <h3>Aucune séance pour l’instant</h3>
          <p>
            Génère un programme complet en indiquant ton nombre de jours, ou crée tes séances une par une. Le guide
            te proposera des compléments.
          </p>
        </div>
      )}

      <ul className="liste-seances">
        {seances?.map((s) => (
          <li key={s.id}>
            <button type="button" className="carte carte-seance" onClick={() => naviguer(`/seances/${s.id}`)}>
              <span className="carte-seance-jours" aria-label="Jours">
                {JOURS_COURTS.map((j, i) => (
                  <span
                    key={j}
                    className={`jour-mini${s.jours.includes(i + 1) ? ' actif' : ''}${i + 1 === aujourdhui ? ' aujourdhui' : ''}`}
                  >
                    {j.charAt(0)}
                  </span>
                ))}
              </span>
              <span className="carte-seance-nom">{nomSeance(s)}</span>
              <span className="carte-seance-meta">
                {s.exercices.length} exercice{s.exercices.length > 1 ? 's' : ''}
                {s.muscles.length > 0 && ` · ${s.muscles.map(libelleMuscle).join(', ')}`}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="actions-bas actions-bas-deux">
        <button type="button" className="bouton large" onClick={() => naviguer('/seances/generer')}>
          <IconeGuide taille={20} />
          Générer un programme
        </button>
        <button type="button" className="bouton principal large" onClick={() => void nouvelle()}>
          <IconePlus taille={22} />
          Nouvelle séance
        </button>
      </div>
    </>
  );
}
