import { useNavigate } from 'react-router-dom';
import { Entete } from '../components/Entete';
import { IconeAujourdhui } from '../components/Icones';
import { exerciceParId } from '../data/exercices';
import { demarrer, useEntrainementEnCours } from '../db/entrainement';
import { nomSeance, useSeances } from '../db/seances';
import type { Seance } from '../db/types';
import { jourSemaine } from '../lib/format';
import { formatChrono, useMaintenant } from '../lib/temps';

/** Écran d'accueil : la séance prévue aujourd'hui et un gros bouton pour la lancer. */
export function Aujourdhui() {
  const naviguer = useNavigate();
  const maintenant = new Date();
  const jour = maintenant.toLocaleDateString('fr-FR', { weekday: 'long' });
  const date = maintenant.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const seances = useSeances();
  const enCours = useEntrainementEnCours();
  const heure = useMaintenant(!!enCours, 1000);

  if (seances === undefined || enCours === undefined) return null;

  const duJour = seances.filter((s) => s.jours.includes(jourSemaine(maintenant)) && s.exercices.length > 0);
  const autres = seances.filter((s) => !duJour.includes(s) && s.exercices.length > 0);

  async function lancer(s: Seance) {
    await demarrer(s);
    naviguer('/seance');
  }

  return (
    <>
      <Entete surtitre={date} titre={jour.charAt(0).toUpperCase() + jour.slice(1)} />

      {enCours && (
        <div className="carte carte-du-jour en-cours">
          <span className="etiquette">Séance en cours · {formatChrono(heure - enCours.debut)}</span>
          <h3>{enCours.nom}</h3>
          <p>
            {enCours.series.filter((s) => !s.echauffement).length} série(s) faite(s). Tout est enregistré au fur et à
            mesure.
          </p>
        </div>
      )}

      {!enCours &&
        duJour.map((s) => (
          <div key={s.id} className="carte carte-du-jour">
            <span className="etiquette">Prévue aujourd’hui</span>
            <h3>{nomSeance(s)}</h3>
            <ol className="apercu-exercices">
              {s.exercices.map((e) => (
                <li key={e.exerciceId}>
                  <span>{exerciceParId(e.exerciceId)?.nom}</span>
                  <span className="chiffres">
                    {e.series} × {e.repsMin === e.repsMax ? e.repsMin : `${e.repsMin}-${e.repsMax}`}
                  </span>
                </li>
              ))}
            </ol>
            {duJour.length > 1 && (
              <button type="button" className="bouton principal" onClick={() => void lancer(s)}>
                Lancer cette séance
              </button>
            )}
          </div>
        ))}

      {!enCours && duJour.length === 0 && (
        <div className="carte vide">
          <IconeAujourdhui taille={30} />
          <h3>Rien de prévu aujourd'hui</h3>
          <p>
            {seances.length
              ? 'Jour de repos… ou lance une autre séance ci-dessous.'
              : 'Crée tes séances et attribue-leur des jours : celle du jour apparaîtra ici, prête à lancer.'}
          </p>
          {seances.length === 0 && (
            <button type="button" className="bouton principal" onClick={() => naviguer('/seances')}>
              Créer une séance
            </button>
          )}
        </div>
      )}

      {!enCours && autres.length > 0 && (
        <section className="section">
          <h2>Autre séance</h2>
          <div className="carte">
            {autres.map((s) => (
              <div key={s.id} className="ligne">
                <div className="libelle">
                  {nomSeance(s)}
                  <small>{s.exercices.length} exercices</small>
                </div>
                <button type="button" className="bouton" onClick={() => void lancer(s)}>
                  Lancer
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {(enCours || duJour.length === 1) && (
        <div className="actions-bas">
          <button
            type="button"
            className="bouton principal large bouton-lancer"
            onClick={() => (enCours ? naviguer('/seance') : void lancer(duJour[0]!))}
          >
            {enCours ? 'Reprendre la séance' : 'Lancer la séance'}
          </button>
        </div>
      )}
    </>
  );
}
