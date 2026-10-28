import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Entete } from '../components/Entete';
import { IconeAujourdhui } from '../components/Icones';
import { db } from '../db/db';
import { nomSeance } from '../db/seances';
import { jourSemaine } from '../lib/format';

/** Écran d'accueil : la séance prévue aujourd'hui et un gros bouton pour la lancer. */
export function Aujourdhui() {
  const naviguer = useNavigate();
  const maintenant = new Date();
  const jour = maintenant.toLocaleDateString('fr-FR', { weekday: 'long' });
  const date = maintenant.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  const seancesDuJour = useLiveQuery(
    () => db.seances.where('jours').equals(jourSemaine(maintenant)).toArray(),
    [],
  );

  return (
    <>
      <Entete surtitre={date} titre={jour.charAt(0).toUpperCase() + jour.slice(1)} />

      {seancesDuJour && seancesDuJour.length === 0 && (
        <div className="carte vide">
          <IconeAujourdhui taille={30} />
          <h3>Rien de prévu aujourd'hui</h3>
          <p>
            Crée tes séances et attribue-leur des jours&nbsp;: celle du jour apparaîtra ici, prête
            à lancer.
          </p>
          <button
            type="button"
            className="bouton principal"
            onClick={() => naviguer('/seances')}
          >
            Voir mes séances
          </button>
        </div>
      )}

      {seancesDuJour?.map((s) => (
        <div key={s.id} className="carte vide">
          <span className="etiquette">
            {s.exercices.length} exercice{s.exercices.length > 1 ? 's' : ''}
          </span>
          <h3>{nomSeance(s)}</h3>
          <p>Le mode séance (lancer, chrono de repos) arrive à l'étape 4.</p>
          <button type="button" className="bouton" onClick={() => naviguer(`/seances/${s.id}`)}>
            Voir la séance
          </button>
        </div>
      ))}
    </>
  );
}
