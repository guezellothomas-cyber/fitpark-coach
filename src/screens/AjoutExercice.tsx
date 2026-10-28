import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BoutonRetour } from '../components/BoutonRetour';
import { Entete } from '../components/Entete';
import { IconeCroix, IconePlus, IconeRecherche } from '../components/Icones';
import { useMessage } from '../components/Message';
import { MUSCLES, libelleZone } from '../data/muscles';
import { libelleType } from '../data/types';
import { useReglages } from '../db/reglages';
import { useExercices } from '../db/salle';
import { ajouterExercice, nomSeance, useSeance } from '../db/seances';
import { correspond } from '../lib/recherche';

/**
 * Choix d'un exercice à ajouter à une séance.
 * La liste est déjà filtrée sur les muscles ciblés et sur ma salle (filtres désactivables).
 */
export function AjoutExercice() {
  const { id = '' } = useParams();
  const seance = useSeance(id);
  const exercices = useExercices();
  const reglages = useReglages();
  const naviguer = useNavigate();
  const afficherMessage = useMessage();
  const [recherche, setRecherche] = useState('');
  const [musclesCibles, setMusclesCibles] = useState(true);
  const [seulementSalle, setSeulementSalle] = useState(true);

  const dejaDansSeance = useMemo(() => new Set(seance?.exercices.map((e) => e.exerciceId)), [seance]);
  const filtrerMuscles = musclesCibles && (seance?.muscles.length ?? 0) > 0;

  // Groupes par muscle : d'abord les muscles de la séance, dans leur ordre, puis les autres.
  const groupes = useMemo(() => {
    if (!exercices || !seance) return [];
    const ordre = [...seance.muscles, ...MUSCLES.map((m) => m.id).filter((m) => !seance.muscles.includes(m))];
    return ordre
      .filter((m) => !filtrerMuscles || seance.muscles.includes(m))
      .map((m) => ({
        muscle: m,
        liste: exercices.filter(
          (e) =>
            e.musclePrincipal === m &&
            (!seulementSalle || e.disponibleDansMaSalle) &&
            (recherche === '' || correspond(e.nom, recherche)),
        ),
      }))
      .filter((g) => g.liste.length > 0);
  }, [exercices, seance, filtrerMuscles, seulementSalle, recherche]);

  if (!seance || !exercices) return null;

  async function choisir(exerciceId: string, nom: string) {
    if (!seance) return;
    await ajouterExercice(seance, exerciceId, reglages);
    afficherMessage(`Ajouté : ${nom}`);
    naviguer(-1);
  }

  return (
    <>
      <BoutonRetour libelle={nomSeance(seance)} repli={`/seances/${seance.id}`} />
      <Entete titre="Ajouter un exercice" />

      <div className="barre-filtres">
        <label className="champ-recherche">
          <IconeRecherche taille={20} />
          <input
            type="search"
            enterKeyHint="search"
            placeholder="Rechercher"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            aria-label="Rechercher un exercice"
          />
          {recherche && (
            <button type="button" className="effacer" onClick={() => setRecherche('')} aria-label="Effacer la recherche">
              <IconeCroix taille={18} />
            </button>
          )}
        </label>
        <div className="puces">
          {seance.muscles.length > 0 && (
            <button type="button" role="switch" aria-checked={musclesCibles} className="puce" onClick={() => setMusclesCibles(!musclesCibles)}>
              Muscles de la séance
            </button>
          )}
          <button type="button" role="switch" aria-checked={seulementSalle} className="puce" onClick={() => setSeulementSalle(!seulementSalle)}>
            Dans ma salle
          </button>
        </div>
      </div>

      <div className="espace-filtres" />

      {groupes.length === 0 && (
        <div className="carte vide">
          <h3>Aucun exercice trouvé</h3>
          <p>Essaie un autre mot ou désactive un filtre.</p>
        </div>
      )}

      {groupes.map((g) => (
        <section key={g.muscle} className="section">
          <h2>{MUSCLES.find((m) => m.id === g.muscle)?.libelle}</h2>
          <ul className="carte liste-exercices">
            {g.liste.map((e) => {
              const deja = dejaDansSeance.has(e.id);
              return (
                <li key={e.id} className={`ligne-exercice${deja ? ' absent' : ''}`}>
                  <button
                    type="button"
                    className="ligne-exercice-lien"
                    disabled={deja}
                    onClick={() => void choisir(e.id, e.nom)}
                  >
                    <span className="ligne-exercice-nom">{e.nom}</span>
                    <span className="ligne-exercice-meta">
                      {deja ? 'Déjà dans la séance' : `${libelleType(e.type)} · ${libelleZone(e.musclePrincipal, e.zone)}`}
                    </span>
                  </button>
                  {!deja && (
                    <span className="ajout-icone" aria-hidden="true">
                      <IconePlus taille={22} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
