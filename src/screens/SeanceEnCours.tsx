import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimationGeste } from '../components/AnimationGeste';
import { ChronoRepos } from '../components/ChronoRepos';
import { Feuille } from '../components/Feuille';
import { FeuilleEchauffement } from '../components/FeuilleEchauffement';
import { FeuilleRemplacement } from '../components/FeuilleRemplacement';
import {
  IconeChevron,
  IconeCoche,
  IconeEchange,
  IconeFlamme,
  IconeHausse,
  IconeLecture,
  IconeRetour,
} from '../components/Icones';
import { useMessage } from '../components/Message';
import { Reglette } from '../components/Reglette';
import { exerciceParId } from '../data/exercices';
import {
  abandonner,
  ajusterRepos,
  allerA,
  arreterRepos,
  enregistrerEchauffement,
  enregistrerSerie,
  modifierSerie,
  remplacerExercice,
  supprimerSerie,
  terminer,
  useDerniereFois,
  useEntrainementEnCours,
} from '../db/entrainement';
import { useReglages } from '../db/reglages';
import { useExercices } from '../db/salle';
import type { Entrainement, ExerciceDeSeance, SerieFaite } from '../db/types';
import { proposerSurcharge, type Surcharge } from '../lib/progression';
import { etapeSuivante, reposApres, restantes, seriesDe, blocDe } from '../lib/deroulement';
import { formatNombre } from '../lib/format';
import { resumerSeries } from '../lib/perf';
import { lancerRaccourci } from '../lib/raccourci';
import { bipFinRepos, deverrouillerSon } from '../lib/son';
import { formatChrono, useEcranAllume, useMaintenant } from '../lib/temps';

/** Mode séance en salle. */
export function SeanceEnCours() {
  const entrainement = useEntrainementEnCours();
  const naviguer = useNavigate();
  if (entrainement === undefined) return null;
  if (entrainement === null || !entrainement.plan?.length) {
    return (
      <div className="carte vide">
        <h3>Aucune séance en cours</h3>
        <p>Lance une séance depuis l’onglet Aujourd’hui.</p>
        <button type="button" className="bouton principal" onClick={() => naviguer('/', { replace: true })}>
          Aujourd’hui
        </button>
      </div>
    );
  }
  return <Deroulement e={entrainement} plan={entrainement.plan} />;
}

function Deroulement({ e, plan }: { e: Entrainement; plan: ExerciceDeSeance[] }) {
  const naviguer = useNavigate();
  const afficherMessage = useMessage();
  const reglages = useReglages();
  const index = Math.min(Math.max(0, e.indexCourant ?? 0), plan.length - 1);
  const item = plan[index]!;
  const exercice = exerciceParId(item.exerciceId);
  const faites = seriesDe(e.series, item.exerciceId);
  const numero = faites.length + 1;
  const derniereFois = useDerniereFois(item.exerciceId, e.id);
  const toutFini = plan.every((_, i) => restantes(plan, e.series, i) === 0);
  const catalogue = useExercices();
  // Surcharge progressive : proposée sur la première série de l'exercice.
  const surcharge =
    faites.length === 0 && derniereFois ? proposerSurcharge(derniereFois, item, reglages.pasCharge) : null;

  const [feuilleFin, setFeuilleFin] = useState(false);
  const [feuilleRemplacer, setFeuilleRemplacer] = useState(false);
  const [feuilleGeste, setFeuilleGeste] = useState(false);
  const [serieEditee, setSerieEditee] = useState<number | null>(null);

  useEcranAllume(true);
  const maintenant = useMaintenant(true);
  const resteRepos = e.finRepos ? (e.finRepos - maintenant) / 1000 : 0;
  const enRepos = e.finRepos != null && resteRepos > 0;
  const reposFini = e.finRepos != null && resteRepos <= 0;

  // Fin du repos vue en direct (app à l'écran) : son court + vibration, puis on efface l'alerte.
  const etaitEnRepos = useRef(enRepos);
  useEffect(() => {
    if (etaitEnRepos.current && !enRepos && reposFini && document.visibilityState === 'visible') {
      if (reglages.son) bipFinRepos();
      navigator.vibrate?.([120, 80, 120]);
    }
    etaitEnRepos.current = enRepos;
  }, [enRepos, reposFini, reglages.son]);
  useEffect(() => {
    if (!reposFini) return;
    const t = window.setTimeout(() => void arreterRepos(e.id), 4000);
    return () => window.clearTimeout(t);
  }, [reposFini, e.id]);

  // Superset : nom de l'exercice lié pour l'afficher.
  const [debutBloc, finBloc] = blocDe(plan, index);
  const partenaires = plan
    .slice(debutBloc, finBloc + 1)
    .filter((p) => p !== item)
    .map((p) => exerciceParId(p.exerciceId)?.nom ?? '');

  async function valider(charge: number, reps: number) {
    deverrouillerSon();
    const serie: SerieFaite = { exerciceId: item.exerciceId, charge, reps, faiteLe: Date.now(), echauffement: false };
    const etape = etapeSuivante(plan, [...e.series, serie], index);
    const repos = etape.repos ? reposApres(plan, index) : 0;
    await enregistrerSerie(e.id, serie, etape.index ?? index, repos);
    navigator.vibrate?.(15);
    if (etape.index === null) {
      setFeuilleFin(true);
      return;
    }
    if (repos > 0 && reglages.minuteurIphone) lancerRaccourci(repos, reglages.retourAuto);
  }

  async function finir() {
    await terminer(e.id);
    naviguer(`/seance/resume/${e.id}`, { replace: true });
  }

  async function toutAbandonner() {
    await abandonner(e.id);
    afficherMessage('Séance abandonnée');
    naviguer('/', { replace: true });
  }

  // Pendant le repos, l'écran montre déjà l'exercice qui vient ensuite.
  const texteEnsuite = `${exercice?.nom ?? ''} · série ${numero}`;

  return (
    <div className="seance">
      <header className="seance-entete">
        <button type="button" className="bouton-retour" onClick={() => naviguer('/')}>
          <IconeRetour taille={22} />
          Accueil
        </button>
        <div className="seance-chrono">
          <span className="seance-nom">{e.nom}</span>
          <span className="chiffres">{formatChrono(maintenant - e.debut)}</span>
        </div>
        <button type="button" className="lien-action" onClick={() => setFeuilleFin(true)}>
          Terminer
        </button>
      </header>

      <nav className="seance-progression" aria-label="Exercices de la séance">
        {plan.map((p, i) => {
          const fait = p.series - restantes(plan, e.series, i);
          return (
            <button
              key={p.exerciceId}
              type="button"
              className={`pastille${i === index ? ' courante' : ''}${fait >= p.series ? ' finie' : ''}`}
              onClick={() => void allerA(e.id, i)}
              aria-label={`${exerciceParId(p.exerciceId)?.nom} : ${fait} série(s) sur ${p.series}`}
            >
              <span style={{ width: `${(fait / p.series) * 100}%` }} />
            </button>
          );
        })}
      </nav>

      <section className="seance-exercice">
        <div className="seance-navigation">
          <button type="button" className="fleche" disabled={index === 0} onClick={() => void allerA(e.id, index - 1)} aria-label="Exercice précédent">
            <IconeRetour taille={24} />
          </button>
          <span className="seance-position">
            Exercice {index + 1} / {plan.length}
            {partenaires.length > 0 && <span className="etiquette">Superset</span>}
          </span>
          <button type="button" className="fleche" disabled={index === plan.length - 1} onClick={() => void allerA(e.id, index + 1)} aria-label="Exercice suivant">
            <IconeChevron taille={24} />
          </button>
        </div>
        <h1 className="seance-titre">{exercice?.nom ?? item.exerciceId}</h1>
        {partenaires.length > 0 && <p className="seance-superset">Enchaîné avec {partenaires.join(', ')}</p>}
        <p className="seance-objectif">
          {numero > item.series ? (
            <>
              Série bonus <strong className="chiffres">{numero}</strong>
            </>
          ) : (
            <>
              Série <strong className="chiffres">{numero}</strong> sur {item.series}
            </>
          )}{' '}
          · objectif {item.repsMin === item.repsMax ? item.repsMin : `${item.repsMin}-${item.repsMax}`} reps
        </p>
        <p className="seance-derniere">
          {derniereFois === undefined
            ? ' '
            : derniereFois.length
              ? `La dernière fois : ${resumerSeries(derniereFois)}`
              : 'Première fois sur cet exercice'}
        </p>

        {faites.length > 0 && (
          <ul className="series-faites">
            {faites.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setSerieEditee(e.series.indexOf(s))}
                  aria-label={`Modifier la série ${i + 1}`}
                >
                  <IconeCoche taille={16} strokeWidth={3} />
                  <span className="chiffres">
                    {s.charge > 0 ? `${formatNombre(s.charge)} × ${s.reps}` : `${s.reps} reps`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {derniereFois !== undefined && (
        <Saisie
          key={`${index}-${item.exerciceId}-${numero}`}
          item={item}
          proposition={proposer(item, faites, derniereFois)}
          pas={reglages.pasCharge}
          surcharge={surcharge}
          echauffementPossible={faites.length === 0}
          onRemplacer={() => setFeuilleRemplacer(true)}
          onGeste={() => setFeuilleGeste(true)}
          onEchauffement={(charge, reps) =>
            void enregistrerEchauffement(e.id, {
              exerciceId: item.exerciceId,
              charge,
              reps,
              faiteLe: Date.now(),
              echauffement: true,
            })
          }
          libelleValider={toutFini ? 'Série bonus' : `Valider la série ${numero}`}
          enRepos={enRepos}
          reposFini={reposFini}
          toutFini={toutFini}
          onValider={(c, r) => void valider(c, r)}
          onTerminer={() => setFeuilleFin(true)}
          chrono={
            enRepos ? (
              <ChronoRepos
                reste={resteRepos}
                total={e.dureeRepos ?? 0}
                ensuite={texteEnsuite}
                onAjuster={(s) => void ajusterRepos(e.id, s)}
                onPasser={() => void arreterRepos(e.id)}
              />
            ) : null
          }
        />
      )}

      <Feuille ouverte={feuilleGeste} onFermer={() => setFeuilleGeste(false)} titre={exercice?.nom ?? 'Geste'}>
        <div className="carte carte-geste">
          <AnimationGeste exerciceId={item.exerciceId} />
        </div>
        <ol className="carte consignes">
          {exercice?.consignes.map((c, i) => (
            <li key={i}>
              <span className="consigne-numero chiffres">{i + 1}</span>
              {c}
            </li>
          ))}
        </ol>
        <div className="actions">
          <button type="button" className="bouton principal large" onClick={() => setFeuilleGeste(false)}>
            Compris
          </button>
        </div>
      </Feuille>

      <FeuilleRemplacement
        ouverte={feuilleRemplacer}
        depart={exercice}
        catalogue={catalogue}
        exclus={new Set(plan.map((p) => p.exerciceId))}
        onChoisir={(id, aussiSeance) => {
          void remplacerExercice(e.id, index, id, aussiSeance);
          setFeuilleRemplacer(false);
          afficherMessage(`Remplacé par : ${exerciceParId(id)?.nom ?? ''}`);
        }}
        onFermer={() => setFeuilleRemplacer(false)}
      />

      <FeuilleSerie
        serie={serieEditee !== null ? (e.series[serieEditee] ?? null) : null}
        pas={reglages.pasCharge}
        onEnregistrer={(s) => {
          if (serieEditee !== null) void modifierSerie(e.id, serieEditee, s);
          setSerieEditee(null);
        }}
        onSupprimer={() => {
          if (serieEditee !== null) void supprimerSerie(e.id, serieEditee);
          setSerieEditee(null);
        }}
        onFermer={() => setSerieEditee(null)}
      />

      <FeuilleFin
        ouverte={feuilleFin}
        toutFini={toutFini}
        nbSeries={e.series.filter((s) => !s.echauffement).length}
        onTerminer={() => void finir()}
        onContinuer={() => setFeuilleFin(false)}
        onAbandonner={() => void toutAbandonner()}
      />
    </div>
  );
}

/**
 * Valeurs proposées pour la série à venir :
 * charge = celle de la série précédente de cette séance, sinon celle de la dernière fois,
 * sinon la charge de départ prévue ; reps = celles de la même série la dernière fois,
 * sinon le haut de la fourchette.
 */
function proposer(item: ExerciceDeSeance, faites: SerieFaite[], derniereFois: SerieFaite[]) {
  const rang = faites.length;
  const precedente = faites.at(-1);
  const memeSerie = derniereFois[rang] ?? derniereFois.at(-1);
  return {
    charge: precedente?.charge ?? memeSerie?.charge ?? item.charge,
    reps: memeSerie?.reps ?? precedente?.reps ?? item.repsMax,
  };
}

interface PropsSaisie {
  item: ExerciceDeSeance;
  proposition: { charge: number; reps: number };
  pas: number;
  surcharge: Surcharge | null;
  echauffementPossible: boolean;
  libelleValider: string;
  enRepos: boolean;
  reposFini: boolean;
  toutFini: boolean;
  chrono: ReactNode;
  onValider: (charge: number, reps: number) => void;
  onTerminer: () => void;
  onRemplacer: () => void;
  onEchauffement: (charge: number, reps: number) => void;
  onGeste: () => void;
}

/** Saisie de la charge et des reps + gros bouton Valider (ou chrono pendant le repos). */
function Saisie({
  proposition,
  pas,
  surcharge,
  echauffementPossible,
  libelleValider,
  enRepos,
  reposFini,
  toutFini,
  chrono,
  onValider,
  onTerminer,
  onRemplacer,
  onEchauffement,
  onGeste,
}: PropsSaisie) {
  const [charge, setCharge] = useState(proposition.charge);
  const [reps, setReps] = useState(proposition.reps);
  const [echauffement, setEchauffement] = useState(false);

  return (
    <>
      <div className="seance-outils">
        <button type="button" className="puce outil" onClick={onGeste}>
          <IconeLecture taille={18} />
          Geste
        </button>
        <button type="button" className="puce outil" onClick={onRemplacer}>
          <IconeEchange taille={18} />
          Remplacer
        </button>
        {echauffementPossible && charge > 0 && (
          <button type="button" className="puce outil" onClick={() => setEchauffement(true)}>
            <IconeFlamme taille={18} />
            Échauffement
          </button>
        )}
      </div>

      {surcharge && (
        <div className={`surcharge${charge >= surcharge.charge ? ' appliquee' : ''}`}>
          <IconeHausse taille={22} />
          <p>
            {charge >= surcharge.charge ? (
              <>
                <strong>{formatNombre(surcharge.charge)} kg</strong> : haut de la fourchette atteint la dernière fois.
              </>
            ) : (
              <>
                Haut de la fourchette atteint la dernière fois : essaie <strong>{formatNombre(surcharge.charge)} kg</strong>.
              </>
            )}
          </p>
          {charge < surcharge.charge && (
            <button type="button" className="bouton principal" onClick={() => setCharge(surcharge.charge)}>
              +{formatNombre(surcharge.charge - surcharge.avant)} kg
            </button>
          )}
        </div>
      )}

      <FeuilleEchauffement
        ouverte={echauffement}
        chargeTravail={charge}
        pas={pas}
        onFaite={onEchauffement}
        onFermer={() => setEchauffement(false)}
      />

      <section className="seance-saisie">
        <div className="saisie-ligne">
          <span className="saisie-libelle">Charge</span>
          <Reglette grande libelle="charge" valeur={charge} pas={pas} min={0} max={500} unite="kg" onChange={setCharge} />
        </div>
        <div className="saisie-ligne">
          <span className="saisie-libelle">Reps</span>
          <Reglette grande libelle="répétitions" valeur={reps} pas={1} min={0} max={100} onChange={setReps} />
        </div>
      </section>

      <div className={`seance-action${reposFini ? ' go' : ''}`}>
        {enRepos ? (
          chrono
        ) : (
          <>
            {reposFini && <p className="seance-go">Repos terminé, c’est reparti !</p>}
            {toutFini && !reposFini && <p className="seance-go">Toutes les séries prévues sont faites</p>}
            <button type="button" className="bouton principal bouton-valider" onClick={() => onValider(charge, reps)}>
              <IconeCoche taille={28} strokeWidth={2.6} />
              {libelleValider}
            </button>
            {toutFini && (
              <button type="button" className="bouton large" onClick={onTerminer}>
                Terminer la séance
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

function FeuilleSerie({
  serie,
  pas,
  onEnregistrer,
  onSupprimer,
  onFermer,
}: {
  serie: SerieFaite | null;
  pas: number;
  onEnregistrer: (s: SerieFaite) => void;
  onSupprimer: () => void;
  onFermer: () => void;
}) {
  return (
    <Feuille ouverte={serie !== null} onFermer={onFermer} titre="Modifier la série">
      {serie && <EditionSerie key={serie.faiteLe} serie={serie} pas={pas} onEnregistrer={onEnregistrer} onSupprimer={onSupprimer} />}
    </Feuille>
  );
}

function EditionSerie({ serie, pas, onEnregistrer, onSupprimer }: { serie: SerieFaite; pas: number; onEnregistrer: (s: SerieFaite) => void; onSupprimer: () => void }) {
  const [charge, setCharge] = useState(serie.charge);
  const [reps, setReps] = useState(serie.reps);
  return (
    <>
      <div className="reglages-exercice">
        <div className="ligne-reglage">
          <span>Charge</span>
          <Reglette libelle="charge" valeur={charge} pas={pas} min={0} max={500} unite="kg" onChange={setCharge} />
        </div>
        <div className="ligne-reglage">
          <span>Reps</span>
          <Reglette libelle="répétitions" valeur={reps} pas={1} min={0} max={100} onChange={setReps} />
        </div>
      </div>
      <div className="actions">
        <button type="button" className="bouton principal large" onClick={() => onEnregistrer({ ...serie, charge, reps })}>
          Enregistrer
        </button>
        <button type="button" className="bouton danger large" onClick={onSupprimer}>
          Supprimer la série
        </button>
      </div>
    </>
  );
}

function FeuilleFin({
  ouverte,
  toutFini,
  nbSeries,
  onTerminer,
  onContinuer,
  onAbandonner,
}: {
  ouverte: boolean;
  toutFini: boolean;
  nbSeries: number;
  onTerminer: () => void;
  onContinuer: () => void;
  onAbandonner: () => void;
}) {
  const [confirmer, setConfirmer] = useState(false);
  return (
    <Feuille ouverte={ouverte} onFermer={onContinuer} titre={toutFini ? 'Bravo, séance finie !' : 'Terminer la séance ?'}>
      <p>
        {nbSeries} série{nbSeries > 1 ? 's' : ''} enregistrée{nbSeries > 1 ? 's' : ''}.
        {!toutFini && ' Il reste des séries prévues : elles ne seront pas comptées.'}
      </p>
      <div className="actions">
        <button type="button" className="bouton principal large" onClick={onTerminer} disabled={nbSeries === 0}>
          Terminer et voir le résumé
        </button>
        <button type="button" className="bouton large" onClick={onContinuer}>
          Continuer la séance
        </button>
        <button
          type="button"
          className="lien-action danger"
          onClick={() => (confirmer ? onAbandonner() : setConfirmer(true))}
        >
          {confirmer ? 'Confirmer : tout effacer' : 'Abandonner sans enregistrer'}
        </button>
      </div>
    </Feuille>
  );
}
