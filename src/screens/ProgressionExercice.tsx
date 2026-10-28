import { Link, useParams } from 'react-router-dom';
import { BoutonRetour } from '../components/BoutonRetour';
import { Courbe } from '../components/Courbe';
import { Entete } from '../components/Entete';
import { exerciceParId } from '../data/exercices';
import { libelleMuscle } from '../data/muscles';
import { useEntrainementsTermines } from '../db/progres';
import { formatNombre } from '../lib/format';
import { resumerSeries } from '../lib/perf';
import { progressionExercice, recordsParExercice } from '../lib/stats';

/** Évolution d'un exercice : records, courbes de charge max et de volume, détail des séances. */
export function ProgressionExercice() {
  const { id = '' } = useParams();
  const exercice = exerciceParId(id);
  const entrainements = useEntrainementsTermines();
  if (!entrainements) return null;

  const points = progressionExercice(entrainements, id);
  const record = recordsParExercice(entrainements).find((r) => r.exerciceId === id);
  const auPoidsDuCorps = points.every((p) => p.chargeMax === 0);

  return (
    <>
      <BoutonRetour libelle="Retour" repli="/progres" />
      <Entete surtitre={exercice ? libelleMuscle(exercice.musclePrincipal) : 'Progression'} titre={exercice?.nom ?? id} />

      {points.length === 0 ? (
        <div className="carte vide">
          <p>Pas encore de séance terminée avec cet exercice.</p>
        </div>
      ) : (
        <>
          {record && (
            <div className="stats">
              <div className="carte stat">
                <span className="stat-valeur chiffres">
                  {auPoidsDuCorps ? record.meilleure.reps : formatNombre(record.meilleure.charge)}
                  <small>{auPoidsDuCorps ? ' reps' : ` kg × ${record.meilleure.reps}`}</small>
                </span>
                <span className="stat-libelle">Meilleure série</span>
              </div>
              <div className="carte stat">
                <span className="stat-valeur chiffres">
                  {record.unRm > 0 ? `≈ ${formatNombre(Math.round(record.unRm))}` : '—'}
                  {record.unRm > 0 && <small> kg</small>}
                </span>
                <span className="stat-libelle">1RM estimé</span>
              </div>
            </div>
          )}

          {!auPoidsDuCorps && (
            <section className="section">
              <h2>Charge maximale</h2>
              <div className="carte bloc-courbe">
                {points.length > 1 ? (
                  <Courbe points={points.map((p) => ({ x: p.date, y: p.chargeMax }))} unite="kg" titre="Charge maximale par séance" />
                ) : (
                  <p className="note-carte">La courbe apparaîtra à partir de 2 séances.</p>
                )}
              </div>
            </section>
          )}

          <section className="section">
            <h2>{auPoidsDuCorps ? 'Répétitions totales' : 'Volume (charge × reps)'}</h2>
            <div className="carte bloc-courbe">
              {points.length > 1 ? (
                <Courbe
                  points={points.map((p) => ({
                    x: p.date,
                    y: auPoidsDuCorps ? p.series.reduce((t, s) => t + s.reps, 0) : Math.round(p.volume),
                  }))}
                  unite={auPoidsDuCorps ? 'reps' : 'kg'}
                  titre="Volume par séance"
                />
              ) : (
                <p className="note-carte">La courbe apparaîtra à partir de 2 séances.</p>
              )}
            </div>
          </section>

          <section className="section">
            <h2>Séances</h2>
            <ul className="carte historique">
              {[...points].reverse().map((p) => (
                <li key={p.date} className="ligne">
                  <div className="libelle">
                    <span className="chiffres historique-perf">{resumerSeries(p.series)}</span>
                    <small>
                      {new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {p.unRm > 0 && ` · 1RM ≈ ${formatNombre(Math.round(p.unRm))} kg`}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
            <p className="note">Le 1RM est estimé avec la formule d’Epley (charge × (1 + reps / 30)) : une approximation, moins fiable au-delà de 10 reps.</p>
          </section>
        </>
      )}

      <Link to={`/exercices/${id}`} className="bouton large">
        Voir la fiche de l’exercice
      </Link>
    </>
  );
}
