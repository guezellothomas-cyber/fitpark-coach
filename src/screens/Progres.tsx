import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Courbe } from '../components/Courbe';
import { Entete } from '../components/Entete';
import { CHAMPS_MESURE, FeuilleMesure } from '../components/FeuilleMesure';
import { IconeChevron, IconePlus, IconeProgres } from '../components/Icones';
import { useMessage } from '../components/Message';
import { SilhouetteMuscles } from '../components/SilhouetteMuscles';
import { exerciceParId } from '../data/exercices';
import { MUSCLES } from '../data/muscles';
import { useEntrainementsTermines, useMesures } from '../db/progres';
import type { Mesure } from '../db/types';
import { formatNombre } from '../lib/format';
import { volume } from '../lib/records';
import { PALIERS, carteSemaine, debutSemaine, equilibre, recordsParExercice, seriesParMuscle } from '../lib/stats';

/** Tableau de bord : semaine en cours, carte du corps, équilibre, records, poids de corps. */
export function Progres() {
  const entrainements = useEntrainementsTermines();
  const mesures = useMesures();
  const afficherMessage = useMessage();
  const [feuilleMesure, setFeuilleMesure] = useState(false);
  const [tousRecords, setTousRecords] = useState(false);

  const lundi = debutSemaine(new Date());
  const semaine = useMemo(() => (entrainements ?? []).filter((e) => e.debut >= lundi), [entrainements, lundi]);
  const seriesSemaine = useMemo(() => semaine.flatMap((e) => e.series).filter((s) => !s.echauffement), [semaine]);
  const parMuscle = useMemo(() => seriesParMuscle(seriesSemaine), [seriesSemaine]);
  const bilan = useMemo(() => equilibre(seriesSemaine), [seriesSemaine]);
  const records = useMemo(() => recordsParExercice(entrainements ?? []), [entrainements]);

  if (!entrainements || !mesures) return null;

  const dateLundi = new Date(lundi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const muscles = MUSCLES.map((m) => ({ ...m, n: parMuscle[m.id] }))
    .filter((m) => m.n > 0)
    .sort((a, b) => b.n - a.n);
  const maxMuscle = Math.max(1, ...muscles.map((m) => m.n));

  return (
    <>
      <Entete surtitre={`Semaine du ${dateLundi}`} titre="Progrès" />

      <div className="stats stats-3">
        <Tuile valeur={semaine.length} libelle={semaine.length > 1 ? 'Séances' : 'Séance'} />
        <Tuile valeur={seriesSemaine.length} libelle="Séries" />
        <Tuile valeur={formatNombre(Math.round(volume(seriesSemaine)))} unite="kg" libelle="Volume" />
      </div>

      {/* ───── Carte du corps ───── */}
      <section className="section">
        <h2>Muscles travaillés cette semaine</h2>
        <div className="carte carte-silhouette">
          <SilhouetteMuscles
            carte={carteSemaine(parMuscle)}
            echelle="volume"
            titre={muscles.length ? `Séries de la semaine : ${muscles.map((m) => `${m.libelle} ${formatNombre(m.n)}`).join(', ')}` : 'Aucune série cette semaine'}
          />
          <div className="silhouette-vues" aria-hidden="true">
            <span>Face</span>
            <span>Dos</span>
          </div>
          <div className="legende">
            {[...PALIERS].reverse().map((p, i) => (
              <span key={p.intensite}>
                <i style={{ background: `var(--vol-${i + 1})` }} /> {p.libelle}
              </span>
            ))}
          </div>
        </div>
        {muscles.length > 0 ? (
          <ul className="carte barres-muscles">
            {muscles.map((m) => (
              <li key={m.id}>
                <span className="barre-nom">{m.libelle}</span>
                <span className="barre-piste">
                  <span className="barre-valeur" style={{ width: `${(m.n / maxMuscle) * 100}%` }} />
                </span>
                <span className="barre-nombre chiffres">{formatNombre(m.n)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="note">Aucune séance terminée cette semaine pour l’instant.</p>
        )}
        <p className="note">Une série compte 1 pour le muscle principal et 0,5 pour chaque muscle secondaire.</p>
      </section>

      {/* ───── Équilibre poussée / tirage ───── */}
      <section className="section">
        <h2>Équilibre poussée / tirage</h2>
        <div className="carte equilibre">
          {bilan.poussee + bilan.tirage === 0 ? (
            <p className="note-carte">Pas encore de séries de poussée ou de tirage cette semaine.</p>
          ) : (
            <>
              <div className="equilibre-libelles">
                <span>
                  <i className="pastille-poussee" /> Poussée <strong className="chiffres">{bilan.poussee}</strong>
                </span>
                <span>
                  <strong className="chiffres">{bilan.tirage}</strong> Tirage <i className="pastille-tirage" />
                </span>
              </div>
              <div
                className="equilibre-barre"
                style={{ '--part': bilan.poussee / (bilan.poussee + bilan.tirage) } as CSSProperties}
                role="img"
                aria-label={`${bilan.poussee} séries de poussée, ${bilan.tirage} séries de tirage`}
              >
                {bilan.poussee > 0 && <span className="part-poussee" />}
                {bilan.tirage > 0 && <span className="part-tirage" />}
              </div>
              {bilan.alerte ? (
                <p className="alerte">
                  <strong>Déséquilibre</strong>
                  {bilan.alerte === 'poussee'
                    ? ' : beaucoup plus de poussée que de tirage. Ajoute du dos (rowing, tirages, face pull).'
                    : ' : beaucoup plus de tirage que de poussée. Ajoute des développés, des pompes ou des dips.'}
                </p>
              ) : bilan.poussee + bilan.tirage < 10 ? (
                <p className="note-carte">À juger à partir de 10 séries dans la semaine.</p>
              ) : (
                <p className="note-carte">Équilibre correct cette semaine.</p>
              )}
            </>
          )}
        </div>
        <p className="note">Les jambes comptent aussi : quadriceps et mollets en poussée, ischios, fessiers et lombaires en tirage.</p>
      </section>

      {/* ───── Records ───── */}
      <section className="section">
        <h2>Records par exercice</h2>
        {records.length === 0 ? (
          <div className="carte vide">
            <IconeProgres taille={30} />
            <p>Tes records apparaîtront ici après ta première séance.</p>
          </div>
        ) : (
          <>
            <ul className="carte historique">
              {(tousRecords ? records : records.slice(0, 6)).map((r) => (
                <li key={r.exerciceId}>
                  <Link to={`/progres/exercice/${r.exerciceId}`} className="ligne ligne-lien">
                    <div className="libelle">
                      {exerciceParId(r.exerciceId)?.nom ?? r.exerciceId}
                      <small>
                        {r.meilleure.charge > 0
                          ? `${formatNombre(r.meilleure.charge)} kg × ${r.meilleure.reps}${r.unRm > 0 ? ` · 1RM ≈ ${formatNombre(Math.round(r.unRm))} kg` : ''}`
                          : `${r.meilleure.reps} reps`}
                      </small>
                    </div>
                    <IconeChevron taille={20} />
                  </Link>
                </li>
              ))}
            </ul>
            {records.length > 6 && (
              <button type="button" className="lien-action" onClick={() => setTousRecords(!tousRecords)}>
                {tousRecords ? 'Afficher moins' : `Voir les ${records.length} exercices`}
              </button>
            )}
            <p className="note">1RM ≈ charge maximale estimée pour une seule répétition (formule d’Epley). C’est une estimation, pas une charge à tenter.</p>
          </>
        )}
      </section>

      {/* ───── Poids de corps et mensurations ───── */}
      <section className="section">
        <div className="titre-section">
          <h2>Poids de corps</h2>
          <button type="button" className="lien-action" onClick={() => setFeuilleMesure(true)}>
            <IconePlus taille={18} />
            Ajouter
          </button>
        </div>
        <PoidsEtMensurations mesures={mesures} onAjouter={() => setFeuilleMesure(true)} />
      </section>

      <FeuilleMesure
        ouverte={feuilleMesure}
        derniere={mesures.at(-1)}
        onFermer={() => setFeuilleMesure(false)}
        onEnregistree={() => {
          setFeuilleMesure(false);
          afficherMessage('Mesure enregistrée');
        }}
      />
    </>
  );
}

function Tuile({ valeur, unite, libelle }: { valeur: number | string; unite?: string; libelle: string }) {
  return (
    <div className="carte stat">
      <span className="stat-valeur chiffres">
        {valeur}
        {unite && <small> {unite}</small>}
      </span>
      <span className="stat-libelle">{libelle}</span>
    </div>
  );
}

const enDate = (iso: string) => new Date(`${iso}T12:00:00`).getTime();

function PoidsEtMensurations({ mesures, onAjouter }: { mesures: Mesure[]; onAjouter: () => void }) {
  const poids = mesures.filter((m) => m.poids !== undefined).map((m) => ({ x: enDate(m.date), y: m.poids! }));

  if (mesures.length === 0) {
    return (
      <div className="carte vide">
        <p>Note ton poids et quelques mensurations de temps en temps : la courbe apparaîtra ici.</p>
        <button type="button" className="bouton principal" onClick={onAjouter}>
          Première mesure
        </button>
      </div>
    );
  }

  const dernierPoids = poids.at(-1);
  const premierPoids = poids[0];

  return (
    <>
      {dernierPoids && (
        <div className="carte bloc-courbe">
          <div className="courbe-tete">
            <span className="stat-valeur chiffres">
              {formatNombre(dernierPoids.y)}
              <small> kg</small>
            </span>
            {premierPoids && poids.length > 1 && (
              <span className="variation">
                {ecart(dernierPoids.y - premierPoids.y, 'kg')} depuis le{' '}
                {new Date(premierPoids.x).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          {poids.length > 1 && <Courbe points={poids} unite="kg" titre="Évolution du poids de corps" />}
        </div>
      )}

      <ul className="carte historique mensurations">
        {CHAMPS_MESURE.filter((c) => c.cle !== 'poids').map((c) => {
          const valeurs = mesures.filter((m) => m[c.cle] !== undefined);
          const derniere = valeurs.at(-1)?.[c.cle];
          const avant = valeurs.at(-2)?.[c.cle];
          return (
            <li key={c.cle} className="ligne">
              <div className="libelle">
                {c.libelle}
                <small>{avant !== undefined && derniere !== undefined ? `${ecart(derniere - avant, c.unite)} depuis la mesure précédente` : ' '}</small>
              </div>
              <span className="chiffres mensuration-valeur">{derniere !== undefined ? `${formatNombre(derniere)} ${c.unite}` : '—'}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function ecart(d: number, unite: string): string {
  const arrondi = Math.round(d * 10) / 10;
  if (arrondi === 0) return `Stable`;
  return `${arrondi > 0 ? '+' : '−'}${formatNombre(Math.abs(arrondi))} ${unite}`;
}
