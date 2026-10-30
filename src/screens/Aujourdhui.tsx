import { useNavigate } from 'react-router-dom';
import { Entete } from '../components/Entete';
import { IconeAujourdhui, IconeCoche } from '../components/Icones';
import { enSecondes, exerciceParId } from '../data/exercices';
import { demarrer, useEntrainementEnCours } from '../db/entrainement';
import { useEntrainementsTermines } from '../db/progres';
import { nomSeance, useSeances } from '../db/seances';
import type { Seance } from '../db/types';
import { JOURS_COURTS, jourSemaine } from '../lib/format';
import { resumerObjectif } from '../lib/perf';
import { debutSemaine } from '../lib/stats';
import { formatChrono, useMaintenant } from '../lib/temps';

const JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const LIBELLES_ETAT = { fait: 'séance faite', prevu: 'séance prévue', manque: 'séance prévue non faite', repos: 'repos' };

/** Écran d'accueil : la séance prévue aujourd'hui et un gros bouton pour la lancer. */
export function Aujourdhui() {
  const naviguer = useNavigate();
  const maintenant = new Date();
  const jour = maintenant.toLocaleDateString('fr-FR', { weekday: 'long' });
  const date = maintenant.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const seances = useSeances();
  const enCours = useEntrainementEnCours();
  const termines = useEntrainementsTermines();
  const heure = useMaintenant(!!enCours, 1000);

  if (seances === undefined || enCours === undefined || termines === undefined) return null;

  const aujourdhui = jourSemaine(maintenant);
  const duJour = seances.filter((s) => s.jours.includes(aujourdhui) && s.exercices.length > 0);
  const autres = seances.filter((s) => !duJour.includes(s) && s.exercices.length > 0);

  // Semaine en cours : jours prévus (séances types) et jours où une séance a été faite.
  const lundi = debutSemaine(maintenant);
  const faits = new Set(termines.filter((e) => e.debut >= lundi).map((e) => jourSemaine(new Date(e.debut))));
  const prevus = new Set(seances.filter((s) => s.exercices.length > 0).flatMap((s) => s.jours));
  // Prochaine séance prévue après aujourd'hui (en bouclant sur la semaine suivante).
  const prochaine = [1, 2, 3, 4, 5, 6, 7]
    .map((d) => ((aujourdhui - 1 + d) % 7) + 1)
    .map((j) => ({ j, s: seances.find((s) => s.jours.includes(j) && s.exercices.length > 0) }))
    .find((x) => x.s);

  async function lancer(s: Seance) {
    await demarrer(s);
    naviguer('/seance');
  }

  return (
    <>
      <Entete surtitre={date} titre={jour.charAt(0).toUpperCase() + jour.slice(1)} />

      {prevus.size > 0 && (
        <div className="semaine" aria-label="Ma semaine">
          <div className="semaine-jours">
            {JOURS_COURTS.map((j, i) => {
              const n = i + 1;
              const etat = faits.has(n) ? 'fait' : prevus.has(n) ? (n < aujourdhui ? 'manque' : 'prevu') : 'repos';
              return (
                <span key={j} className={`semaine-jour ${etat}${n === aujourdhui ? ' aujourdhui' : ''}`}>
                  <span className="semaine-lettre">{j.charAt(0)}</span>
                  <span className="semaine-pastille" aria-label={`${JOURS_LONGS[i]} : ${LIBELLES_ETAT[etat]}`}>
                    {etat === 'fait' && <IconeCoche taille={14} strokeWidth={3.2} />}
                  </span>
                </span>
              );
            })}
          </div>
          <p className="semaine-texte">
            {faits.size} séance{faits.size > 1 ? 's' : ''} faite{faits.size > 1 ? 's' : ''} sur {prevus.size} prévue
            {prevus.size > 1 ? 's' : ''} cette semaine
          </p>
        </div>
      )}

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
                    {resumerObjectif(e.prevues.length, e.repsMin, e.repsMax, enSecondes(e.exerciceId))}
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
          <h3>{seances.length ? 'Jour de repos' : "Rien de prévu aujourd'hui"}</h3>
          <p>
            {prochaine?.s
              ? `Prochaine séance : ${JOURS_LONGS[prochaine.j - 1]}, ${nomSeance(prochaine.s)}. Tu peux aussi lancer une autre séance ci-dessous.`
              : seances.length
                ? 'Lance une séance ci-dessous, ou attribue des jours à tes séances.'
                : 'Crée tes séances (ou génère un programme) : celle du jour apparaîtra ici, prête à lancer.'}
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
                  <small>
                    {s.exercices.length} exercice{s.exercices.length > 1 ? 's' : ''}
                    {s.jours.length > 0 && ` · ${s.jours.map((j) => JOURS_LONGS[j - 1]).join(', ')}`}
                  </small>
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
