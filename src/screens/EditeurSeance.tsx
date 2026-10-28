import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BoutonRetour } from '../components/BoutonRetour';
import { Feuille } from '../components/Feuille';
import { IconeGuide, IconePlus, IconeTri } from '../components/Icones';
import { ListeExercicesSeance } from '../components/ListeExercicesSeance';
import { useMessage } from '../components/Message';
import { ReglageExercice } from '../components/ReglageExercice';
import { EXERCICES, exerciceParId } from '../data/exercices';
import { MUSCLES, libelleMuscle, type MuscleId } from '../data/muscles';
import { useReglages } from '../db/reglages';
import { useExercices } from '../db/salle';
import { ajouterExercice, majSeance, nomSeance, supprimerSeance, useSeance } from '../db/seances';
import type { ExerciceDeSeance, Seance } from '../db/types';
import { JOURS_COURTS } from '../lib/format';
import { suggerer, type Suggestion } from '../lib/guide';
import { ordonner } from '../lib/ordre';

const JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MUSCLES_CIBLABLES = MUSCLES.filter((m) => EXERCICES.some((e) => e.musclePrincipal === m.id));

/** Création / modification d'une séance. Tout est enregistré au fur et à mesure. */
export function EditeurSeance() {
  const { id = '' } = useParams();
  const seance = useSeance(id);

  if (seance === undefined) return null;
  if (seance === null) {
    return (
      <>
        <BoutonRetour libelle="Séances" repli="/seances" />
        <div className="carte vide">
          <h3>Séance introuvable</h3>
          <p>Elle a peut-être été supprimée.</p>
        </div>
      </>
    );
  }
  return <Editeur seance={seance} />;
}

function Editeur({ seance }: { seance: Seance }) {
  const naviguer = useNavigate();
  const afficherMessage = useMessage();
  const reglages = useReglages();
  const catalogue = useExercices();
  const [enEdition, setEnEdition] = useState<number | null>(null);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);

  // Copie locale de la liste : le glisser-déposer s'affiche tout de suite, sans attendre la base.
  const [exercices, setExercices] = useState(seance.exercices);
  useEffect(() => setExercices(seance.exercices), [seance.exercices]);
  function changerExercices(liste: ExerciceDeSeance[]) {
    setExercices(liste);
    void majSeance(seance.id, { exercices: liste });
  }

  // Le nom est enregistré un court instant après la frappe.
  const [nom, setNom] = useState(seance.nom);
  const minuteurNom = useRef<number | undefined>(undefined);
  function changerNom(valeur: string) {
    setNom(valeur);
    window.clearTimeout(minuteurNom.current);
    minuteurNom.current = window.setTimeout(() => void majSeance(seance.id, { nom: valeur }), 400);
  }

  function basculerJour(jour: number) {
    const jours = seance.jours.includes(jour) ? seance.jours.filter((j) => j !== jour) : [...seance.jours, jour].sort();
    void majSeance(seance.id, { jours });
  }

  function basculerMuscle(m: MuscleId) {
    const muscles = seance.muscles.includes(m) ? seance.muscles.filter((x) => x !== m) : [...seance.muscles, m];
    void majSeance(seance.id, { muscles });
  }

  function remettreEnOrdre() {
    changerExercices(ordonner(exercices, seance.muscles));
    afficherMessage('Exercices remis dans l’ordre conseillé');
  }

  async function ajouterSuggestion(s: Suggestion) {
    await ajouterExercice({ ...seance, exercices }, s.exercice.id, reglages);
    afficherMessage(`Ajouté : ${s.exercice.nom}`);
  }

  async function supprimer() {
    await supprimerSeance(seance.id);
    naviguer('/seances', { replace: true });
    afficherMessage('Séance supprimée');
  }

  // Suggestions du guide, par muscle ciblé : à partir du premier exercice de ce muscle,
  // tant que le muscle a moins de 3 exercices.
  const suggestions = useMemo(() => {
    if (!catalogue) return [];
    const choisis = exercices.map((e) => exerciceParId(e.exerciceId)).filter((e) => e !== undefined);
    const dejaProposes = new Set<string>();
    return seance.muscles.flatMap((m) => {
      const duMuscle = choisis.filter((e) => e.musclePrincipal === m);
      const depart = duMuscle[0];
      if (!depart || duMuscle.length >= 3) return [];
      const liste = suggerer(depart, catalogue, choisis).filter((s) => !dejaProposes.has(s.exercice.id));
      liste.forEach((s) => dejaProposes.add(s.exercice.id));
      return liste.length ? [{ muscle: m, depart, liste }] : [];
    });
  }, [catalogue, exercices, seance.muscles]);

  const itemEdite = enEdition !== null ? (exercices[enEdition] ?? null) : null;

  return (
    <>
      <BoutonRetour libelle="Séances" repli="/seances" />

      <input
        className="titre-editable"
        value={nom}
        placeholder={nomSeance({ nom: '', muscles: seance.muscles })}
        onChange={(e) => changerNom(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        enterKeyHint="done"
        aria-label="Nom de la séance"
        maxLength={40}
      />

      <section className="section">
        <h2>Jours</h2>
        <div className="jours" role="group" aria-label="Jours de la semaine">
          {JOURS_COURTS.map((j, i) => (
            <button
              key={j}
              type="button"
              className="jour"
              aria-pressed={seance.jours.includes(i + 1)}
              aria-label={JOURS_LONGS[i]}
              onClick={() => basculerJour(i + 1)}
            >
              {j.charAt(0)}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Muscles ciblés</h2>
        <div className="muscles-choix">
          {MUSCLES_CIBLABLES.map((m) => {
            const rang = seance.muscles.indexOf(m.id);
            return (
              <button
                key={m.id}
                type="button"
                className="puce"
                aria-pressed={rang !== -1}
                onClick={() => basculerMuscle(m.id)}
              >
                {rang !== -1 && <span className="rang chiffres">{rang + 1}</span>}
                {m.libelle}
              </button>
            );
          })}
        </div>
        <p className="note">Dans l’ordre de priorité : le n°1 est le muscle principal de la séance.</p>
      </section>

      <section className="section">
        <div className="titre-section">
          <h2>Exercices</h2>
          {exercices.length > 1 && (
            <button type="button" className="lien-action" onClick={remettreEnOrdre}>
              <IconeTri taille={18} />
              Ordre conseillé
            </button>
          )}
        </div>

        {exercices.length === 0 ? (
          <div className="carte vide">
            <p>
              {seance.muscles.length
                ? 'Ajoute un premier exercice : le guide te proposera ensuite deux compléments.'
                : 'Choisis d’abord les muscles ciblés, puis ajoute un premier exercice.'}
            </p>
          </div>
        ) : (
          <ListeExercicesSeance exercices={exercices} onChange={changerExercices} onOuvrir={setEnEdition} />
        )}
      </section>

      {suggestions.map((g) => (
        <section key={g.muscle} className="section">
          <h2 className="titre-guide">
            <IconeGuide taille={16} /> Le guide · {libelleMuscle(g.muscle)}
          </h2>
          <div className="carte">
            <p className="guide-contexte">Pour compléter « {g.depart.nom} » :</p>
            {g.liste.map((s) => (
              <div key={s.exercice.id} className="ligne suggestion">
                <div className="libelle">
                  {s.exercice.nom}
                  <small>{s.raison}</small>
                </div>
                <button
                  type="button"
                  className="bouton-rond"
                  aria-label={`Ajouter ${s.exercice.nom}`}
                  onClick={() => void ajouterSuggestion(s)}
                >
                  <IconePlus taille={22} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="section centre">
        <button type="button" className="lien-action danger" onClick={() => setConfirmerSuppression(true)}>
          Supprimer la séance
        </button>
      </section>

      <div className="actions-bas">
        <button
          type="button"
          className="bouton principal large"
          onClick={() => naviguer(`/seances/${seance.id}/ajouter`)}
        >
          <IconePlus taille={22} />
          Ajouter un exercice
        </button>
      </div>

      <ReglageExercice
        item={itemEdite}
        onChange={(item) => enEdition !== null && changerExercices(exercices.map((e, i) => (i === enEdition ? item : e)))}
        onRetirer={() => {
          if (enEdition === null) return;
          changerExercices(exercices.filter((_, i) => i !== enEdition));
          setEnEdition(null);
        }}
        onFermer={() => setEnEdition(null)}
      />

      <Feuille
        ouverte={confirmerSuppression}
        onFermer={() => setConfirmerSuppression(false)}
        titre="Supprimer cette séance ?"
      >
        <p>« {nomSeance(seance)} » sera supprimée. L’historique de tes entraînements est conservé.</p>
        <div className="actions">
          <button type="button" className="bouton danger large" onClick={() => void supprimer()}>
            Supprimer
          </button>
          <button type="button" className="bouton large" onClick={() => setConfirmerSuppression(false)}>
            Annuler
          </button>
        </div>
      </Feuille>
    </>
  );
}
