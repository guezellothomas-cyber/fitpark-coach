import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CaseSalle } from '../components/CaseSalle';
import { Entete } from '../components/Entete';
import { IconeCroix, IconeRecherche } from '../components/Icones';
import { Puces } from '../components/Puces';
import { EXERCICES } from '../data/exercices';
import { MUSCLES, libelleZone, type MuscleId } from '../data/muscles';
import { TYPES, libelleType, type Exercice, type TypeExercice } from '../data/types';
import { useExercices } from '../db/salle';
import { correspond } from '../lib/recherche';

// Seuls les muscles qui ont au moins un exercice principal apparaissent dans les filtres.
const MUSCLES_FILTRE = MUSCLES.filter((m) => EXERCICES.some((e) => e.musclePrincipal === m.id));

const OPTIONS_MUSCLE = [
  { valeur: 'tous', libelle: 'Tous' },
  ...MUSCLES_FILTRE.map((m) => ({ valeur: m.id, libelle: m.libelle })),
] as const;

const OPTIONS_TYPE = [
  { valeur: 'tous', libelle: 'Tout matériel' },
  ...TYPES.map((t) => ({ valeur: t.id, libelle: t.libelle })),
] as const;

/**
 * Bibliothèque d'exercices : recherche, filtres, et cochage de ce qui existe dans ma salle.
 * Les filtres sont gardés dans l'adresse (?muscle=dos…) : ils sont retrouvés au retour d'une fiche.
 */
export function Exercices() {
  const exercices = useExercices();
  const [params, setParams] = useSearchParams();
  const recherche = params.get('q') ?? '';
  const muscle = (params.get('muscle') ?? 'tous') as MuscleId | 'tous';
  const type = (params.get('type') ?? 'tous') as TypeExercice | 'tous';
  const seulementSalle = params.get('salle') === '1';

  function filtrer(cle: string, valeur: string) {
    const p = new URLSearchParams(params);
    if (valeur === '' || valeur === 'tous') p.delete(cle);
    else p.set(cle, valeur);
    setParams(p, { replace: true });
  }

  const resultats = useMemo(
    () =>
      (exercices ?? []).filter(
        (e) =>
          (muscle === 'tous' || e.musclePrincipal === muscle) &&
          (type === 'tous' || e.type === type) &&
          (!seulementSalle || e.disponibleDansMaSalle) &&
          (recherche === '' || correspond(e.nom, recherche)),
      ),
    [exercices, muscle, type, seulementSalle, recherche],
  );

  // Regroupement par muscle principal, dans l'ordre du corps.
  const groupes = MUSCLES_FILTRE.map((m) => ({
    muscle: m,
    exercices: resultats.filter((e) => e.musclePrincipal === m.id),
  })).filter((g) => g.exercices.length > 0);

  const nbDispo = exercices?.filter((e) => e.disponibleDansMaSalle).length ?? 0;
  const filtresActifs = recherche !== '' || muscle !== 'tous' || type !== 'tous' || seulementSalle;

  return (
    <>
      <Entete
        surtitre={exercices ? `${nbDispo} sur ${exercices.length} dans ma salle` : 'Bibliothèque'}
        titre="Exercices"
      />

      <div className="barre-filtres">
        <label className="champ-recherche">
          <IconeRecherche taille={20} />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder="Rechercher un exercice"
            value={recherche}
            onChange={(e) => filtrer('q', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            aria-label="Rechercher un exercice"
          />
          {recherche && (
            <button type="button" className="effacer" onClick={() => filtrer('q', '')} aria-label="Effacer la recherche">
              <IconeCroix taille={18} />
            </button>
          )}
        </label>
        <Puces libelle="Muscle" options={OPTIONS_MUSCLE} valeur={muscle} onChange={(v) => filtrer('muscle', v)} />
      </div>

      {/* Filtres secondaires : ils défilent avec la liste pour laisser plus de place */}
      <div className="puces filtres-secondaires">
          <button
            type="button"
            role="switch"
            aria-checked={seulementSalle}
            className="puce"
            onClick={() => filtrer('salle', seulementSalle ? '' : '1')}
          >
            Dans ma salle
          </button>
          <span className="puces-separateur" aria-hidden="true" />
          {OPTIONS_TYPE.map((o) => (
            <button
              key={o.valeur}
              type="button"
              role="radio"
              aria-checked={o.valeur === type}
              className="puce"
              onClick={() => filtrer('type', o.valeur)}
            >
              {o.libelle}
            </button>
          ))}
      </div>

      {exercices && resultats.length === 0 && (
        <div className="carte vide">
          <h3>Aucun exercice trouvé</h3>
          <p>Essaie un autre mot ou retire un filtre.</p>
          {filtresActifs && (
            <button type="button" className="bouton" onClick={() => setParams({}, { replace: true })}>
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {groupes.map((g) => (
        <section key={g.muscle.id} className="section">
          <h2>
            {g.muscle.libelle} <span className="compte">{g.exercices.length}</span>
          </h2>
          <ul className="carte liste-exercices">
            {g.exercices.map((e) => (
              <LigneExercice key={e.id} exercice={e} />
            ))}
          </ul>
        </section>
      ))}

      {exercices && resultats.length > 0 && (
        <p className="note">Touche le rond à droite pour indiquer si l’exercice est faisable dans ta salle.</p>
      )}
    </>
  );
}

function LigneExercice({ exercice: e }: { exercice: Exercice }) {
  return (
    <li className={`ligne-exercice${e.disponibleDansMaSalle ? '' : ' absent'}`}>
      <Link to={`/exercices/${e.id}`} className="ligne-exercice-lien">
        <span className="ligne-exercice-nom">{e.nom}</span>
        <span className="ligne-exercice-meta">
          {libelleType(e.type)} · {libelleZone(e.musclePrincipal, e.zone)}
        </span>
      </Link>
      <CaseSalle exerciceId={e.id} nom={e.nom} disponible={e.disponibleDansMaSalle} />
    </li>
  );
}
