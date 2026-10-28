import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoutonRetour } from '../components/BoutonRetour';
import { Entete } from '../components/Entete';
import { IconeGuide } from '../components/Icones';
import { Interrupteur } from '../components/Interrupteur';
import { useMessage } from '../components/Message';
import { MiniatureExercice } from '../components/MiniatureExercice';
import { exerciceParId } from '../data/exercices';
import { useExercices } from '../db/salle';
import { creerProgramme, useSeances } from '../db/seances';
import { JOURS_COURTS } from '../lib/format';
import { JOURS_PAR_DEFAUT, REPARTITIONS, genererProgramme } from '../lib/generateur';

const NOMBRES = [2, 3, 4, 5, 6] as const;
const JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/**
 * Générateur de programme : nombre de jours → répartition proposée → séances pré-remplies
 * avec des exercices de ma salle (règles du guide). Tout reste modifiable ensuite.
 */
export function GenerateurProgramme() {
  const naviguer = useNavigate();
  const afficherMessage = useMessage();
  const catalogue = useExercices();
  const existantes = useSeances();

  const [nbJours, setNbJours] = useState(4);
  const [repartitionId, setRepartitionId] = useState(REPARTITIONS[4]![0]!.id);
  const [jours, setJours] = useState<number[]>(JOURS_PAR_DEFAUT[4]!);
  const [graine, setGraine] = useState(0);
  const [remplacer, setRemplacer] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const repartitions = REPARTITIONS[nbJours]!;
  const repartition = repartitions.find((r) => r.id === repartitionId) ?? repartitions[0]!;
  const programme = useMemo(
    () => (catalogue ? genererProgramme(repartition, catalogue, graine) : []),
    [repartition, catalogue, graine],
  );
  const joursTries = [...jours].sort((a, b) => a - b);
  const joursOk = jours.length === nbJours;

  function choisirNombre(n: number) {
    setNbJours(n);
    setRepartitionId(REPARTITIONS[n]![0]!.id);
    setJours(JOURS_PAR_DEFAUT[n]!);
    setGraine(0);
  }

  function basculerJour(j: number) {
    setJours(jours.includes(j) ? jours.filter((x) => x !== j) : [...jours, j]);
  }

  async function creer() {
    setEnCours(true);
    await creerProgramme(programme, jours, remplacer);
    afficherMessage(`${programme.length} séances créées`);
    naviguer('/seances', { replace: true });
  }

  return (
    <>
      <BoutonRetour libelle="Séances" repli="/seances" />
      <Entete surtitre="Le guide" titre="Générer un programme" />

      <section className="section">
        <h2>Jours d’entraînement par semaine</h2>
        <div className="nombres-jours" role="radiogroup" aria-label="Nombre de jours par semaine">
          {NOMBRES.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === nbJours}
              className="nombre-jour chiffres"
              onClick={() => choisirNombre(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Répartition</h2>
        <div className="repartitions" role="radiogroup" aria-label="Répartition">
          {repartitions.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={r.id === repartition.id}
              className="carte repartition"
              onClick={() => {
                setRepartitionId(r.id);
                setGraine(0);
              }}
            >
              <span className="repartition-nom">{r.nom}</span>
              <span className="repartition-texte">{r.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Jours</h2>
        <div className="jours" role="group" aria-label="Jours de la semaine">
          {JOURS_COURTS.map((j, i) => (
            <button
              key={j}
              type="button"
              className="jour"
              aria-pressed={jours.includes(i + 1)}
              aria-label={JOURS_LONGS[i]}
              onClick={() => basculerJour(i + 1)}
            >
              {j.charAt(0)}
            </button>
          ))}
        </div>
        <p className={`note${joursOk ? '' : ' note-alerte'}`}>
          {joursOk
            ? 'Les séances sont placées dans cet ordre, du lundi au dimanche.'
            : `Choisis ${nbJours} jours (${jours.length} sélectionné${jours.length > 1 ? 's' : ''}).`}
        </p>
      </section>

      <section className="section">
        <div className="titre-section">
          <h2>Aperçu</h2>
          <button type="button" className="lien-action" onClick={() => setGraine(graine + 1)}>
            <IconeGuide taille={18} />
            Autre proposition
          </button>
        </div>
        <div className="apercu-programme">
          {programme.map((s, i) => (
            <div key={`${s.nom}-${i}`} className="carte apercu-seance">
              <div className="apercu-seance-tete">
                <span className="etiquette">{joursTries[i] ? JOURS_LONGS[joursTries[i]! - 1] : '—'}</span>
                <h3>{s.nom}</h3>
              </div>
              <ol>
                {s.exercices.map((e) => (
                  <li key={e.exerciceId}>
                    <MiniatureExercice exerciceId={e.exerciceId} />
                    <span className="apercu-nom">{exerciceParId(e.exerciceId)?.nom}</span>
                    <span className="chiffres apercu-series">
                      {e.series} × {e.repsMin}-{e.repsMax}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="note">
          Exercices choisis parmi ceux de ta salle, avec les règles du guide (base lourde d’abord, zones variées,
          compléments). Tout reste modifiable ensuite, séance par séance.
        </p>
      </section>

      {existantes && existantes.length > 0 && (
        <section className="section">
          <div className="carte ligne">
            <div className="libelle">
              Remplacer mes séances actuelles
              <small>
                {remplacer
                  ? `Tes ${existantes.length} séance(s) seront supprimées. L’historique est conservé.`
                  : `Sinon, le programme s’ajoute à tes ${existantes.length} séance(s).`}
              </small>
            </div>
            <Interrupteur libelle="Remplacer mes séances actuelles" actif={remplacer} onChange={setRemplacer} />
          </div>
        </section>
      )}

      <div className="actions-bas">
        <button
          type="button"
          className="bouton principal large"
          disabled={!joursOk || programme.length === 0 || enCours}
          onClick={() => void creer()}
        >
          Créer les {programme.length} séances
        </button>
      </div>
    </>
  );
}
