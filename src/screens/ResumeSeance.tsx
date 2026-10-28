import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Entete } from '../components/Entete';
import { exerciceParId } from '../data/exercices';
import { seriesAvant, useEntrainement } from '../db/entrainement';
import { formatNombre } from '../lib/format';
import { resumerSeries } from '../lib/perf';
import { recordsBattus, volume, type Record } from '../lib/records';
import { formatChrono } from '../lib/temps';

/** Résumé affiché à la fin d'une séance : durée, volume, records battus. */
export function ResumeSeance() {
  const { id = '' } = useParams();
  const e = useEntrainement(id);
  const naviguer = useNavigate();
  const [records, setRecords] = useState<Record[] | null>(null);

  useEffect(() => {
    if (!e) return;
    void seriesAvant(e.debut).then((avant) => setRecords(recordsBattus(e.series, avant)));
  }, [e]);

  if (!e) return null;
  const travail = e.series.filter((s) => !s.echauffement);
  const ordre = [...new Set(travail.map((s) => s.exerciceId))];
  const date = new Date(e.debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <Entete surtitre={date} titre="Séance terminée" />

      <div className="stats">
        <div className="carte stat">
          <span className="stat-valeur chiffres">{formatChrono((e.fin ?? Date.now()) - e.debut)}</span>
          <span className="stat-libelle">Durée</span>
        </div>
        <div className="carte stat">
          <span className="stat-valeur chiffres">
            {formatNombre(Math.round(volume(travail)))}
            <small> kg</small>
          </span>
          <span className="stat-libelle">Volume total</span>
        </div>
        <div className="carte stat">
          <span className="stat-valeur chiffres">{travail.length}</span>
          <span className="stat-libelle">Séries</span>
        </div>
        <div className="carte stat">
          <span className="stat-valeur chiffres">{records?.length ?? '…'}</span>
          <span className="stat-libelle">Records battus</span>
        </div>
      </div>

      {records && records.length > 0 && (
        <section className="section">
          <h2>Records battus</h2>
          <ul className="carte historique">
            {records.map((r) => (
              <li key={r.exerciceId} className="ligne record">
                <div className="libelle">
                  {exerciceParId(r.exerciceId)?.nom}
                  <small>
                    {r.type === 'charge'
                      ? `Charge max : ${formatNombre(r.valeur)} kg (avant ${formatNombre(r.ancien)} kg)`
                      : `1RM estimé : ${formatNombre(r.valeur)} kg (avant ${formatNombre(r.ancien)} kg)`}
                  </small>
                </div>
                <span className="etiquette">Record</span>
              </li>
            ))}
          </ul>
          {records.some((r) => r.type === '1rm') && (
            <p className="note">Le 1RM est une estimation (formule d’Epley), pas une charge réellement soulevée.</p>
          )}
        </section>
      )}

      <section className="section">
        <h2>Détail</h2>
        <ul className="carte historique">
          {ordre.map((id) => (
            <li key={id} className="ligne">
              <div className="libelle">
                {exerciceParId(id)?.nom ?? id}
                <small className="chiffres">{resumerSeries(travail.filter((s) => s.exerciceId === id))}</small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="actions-bas">
        <button type="button" className="bouton principal large" onClick={() => naviguer('/', { replace: true })}>
          Retour à l’accueil
        </button>
      </div>
    </>
  );
}
