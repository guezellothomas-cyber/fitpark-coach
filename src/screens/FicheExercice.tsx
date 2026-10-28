import { Link, useParams } from 'react-router-dom';
import { AnimationGeste } from '../components/AnimationGeste';
import { BoutonRetour } from '../components/BoutonRetour';
import { Entete } from '../components/Entete';
import { Interrupteur } from '../components/Interrupteur';
import { SilhouetteMuscles } from '../components/SilhouetteMuscles';
import { libelleMuscle, libelleZone } from '../data/muscles';
import { regionsExercice } from '../data/regions';
import { libelleType, type Exercice } from '../data/types';
import { useHistoriqueExercice } from '../db/historique';
import { definirDisponible, useExercices } from '../db/salle';
import { resumerSeries } from '../lib/perf';

const TEXTE_CHARGE = {
  etirement: {
    titre: 'Chargé en étirement',
    texte: 'Le plus dur quand le muscle est allongé, en bas du mouvement.',
  },
  contraction: {
    titre: 'Chargé en contraction',
    texte: 'Le plus dur quand le muscle est contracté, en fin de mouvement.',
  },
} as const;

const TEXTE_ARTICULATION = {
  polyarticulaire: 'Polyarticulaire : plusieurs articulations bougent, on peut charger lourd.',
  isolation: 'Isolation : une seule articulation bouge, le muscle est ciblé.',
} as const;

const TEXTE_SENS = { poussee: 'Poussée', tirage: 'Tirage', neutre: 'Gainage / neutre' } as const;

/** Fiche détaillée : description, consignes, disponibilité et mon historique sur l'exercice. */
export function FicheExercice() {
  const { id = '' } = useParams();
  const exercices = useExercices();
  const exercice = exercices?.find((e) => e.id === id);

  if (!exercices) return null;
  if (!exercice) {
    return (
      <>
        <BoutonRetour libelle="Retour" repli="/exercices" />
        <div className="carte vide">
          <h3>Exercice introuvable</h3>
        </div>
      </>
    );
  }
  return <Fiche exercice={exercice} />;
}

function Fiche({ exercice: e }: { exercice: Exercice }) {
  const historique = useHistoriqueExercice(e.id);
  const charge = TEXTE_CHARGE[e.positionCharge];

  return (
    <>
      <BoutonRetour libelle="Retour" repli="/exercices" />
      <Entete surtitre={libelleMuscle(e.musclePrincipal)} titre={e.nom} />

      <div className="etiquettes">
        <span className="etiquette">{libelleType(e.type)}</span>
        <span className="etiquette neutre">
          {e.mouvement.articulation === 'polyarticulaire' ? 'Polyarticulaire' : 'Isolation'}
        </span>
        <span className="etiquette neutre">{TEXTE_SENS[e.mouvement.sens]}</span>
      </div>

      <section className="section">
        <h2>Le geste</h2>
        <div className="carte carte-geste">
          <AnimationGeste exerciceId={e.id} />
          <p className="geste-legende">Montée contrôlée, descente lente</p>
        </div>
        <ol className="carte consignes">
          {e.consignes.map((c, i) => (
            <li key={i}>
              <span className="consigne-numero chiffres">{i + 1}</span>
              {c}
            </li>
          ))}
        </ol>
      </section>

      <div className="carte carte-silhouette">
        <SilhouetteMuscles
          carte={regionsExercice(e)}
          titre={`Muscles travaillés : ${[e.musclePrincipal, ...e.musclesSecondaires].map(libelleMuscle).join(', ')}`}
        />
        <div className="silhouette-vues" aria-hidden="true">
          <span>Face</span>
          <span>Dos</span>
        </div>
        <div className="legende">
          <span>
            <i style={{ background: 'var(--rouge-vif)' }} /> Travaille le plus
          </span>
          {e.musclesSecondaires.length > 0 && (
            <span>
              <i style={{ background: 'var(--rouge-clair)' }} /> Travaille aussi
            </span>
          )}
        </div>
      </div>

      <section className="section">
        <h2>Ce qu’il travaille</h2>
        <div className="carte">
          <div className="ligne">
            <div className="libelle">
              {libelleMuscle(e.musclePrincipal)}
              <small>{libelleZone(e.musclePrincipal, e.zone)}</small>
            </div>
            <span className="etiquette">Principal</span>
          </div>
          {e.musclesSecondaires.length > 0 && (
            <div className="ligne">
              <div className="libelle">
                {e.musclesSecondaires.map(libelleMuscle).join(', ')}
                <small>Muscles secondaires</small>
              </div>
            </div>
          )}
          <div className="ligne">
            <div className="libelle">
              {charge.titre}
              <small>{charge.texte}</small>
            </div>
          </div>
          <div className="ligne">
            <div className="libelle">
              <small>{TEXTE_ARTICULATION[e.mouvement.articulation]}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Ma salle</h2>
        <div className="carte ligne">
          <div className="libelle">
            Disponible dans ma salle
            <small>
              {e.disponibleDansMaSalle
                ? 'Proposé dans les séances et les suggestions'
                : 'Jamais proposé dans les séances ni les suggestions'}
            </small>
          </div>
          <Interrupteur
            libelle="Disponible dans ma salle"
            actif={e.disponibleDansMaSalle}
            onChange={(v) => void definirDisponible(e.id, v)}
          />
        </div>
      </section>

      <section className="section">
        <h2>Mon historique</h2>
        {historique && historique.length === 0 && (
          <p className="carte ligne note-carte">Pas encore de série enregistrée sur cet exercice.</p>
        )}
        {historique && historique.length > 0 && (
          <Link to={`/progres/exercice/${e.id}`} className="bouton large lien-progression">
            Voir la progression et les records
          </Link>
        )}
        {historique && historique.length > 0 && (
          <ul className="carte historique">
            {historique.map((h) => (
              <li key={h.entrainementId} className="ligne">
                <div className="libelle">
                  <span className="chiffres historique-perf">{resumerSeries(h.series, e.mesure === 'secondes')}</span>
                  <small>
                    {new Date(h.date).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · {h.nomSeance}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
