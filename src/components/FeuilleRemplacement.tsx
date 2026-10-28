import { useState } from 'react';
import { libelleZone } from '../data/muscles';
import { libelleType, type Exercice, type ExerciceCatalogue } from '../data/types';
import { equivalents } from '../lib/remplacement';
import { Feuille } from './Feuille';
import { Interrupteur } from './Interrupteur';
import { MiniatureExercice } from './MiniatureExercice';

interface Props {
  ouverte: boolean;
  depart: ExerciceCatalogue | undefined;
  catalogue: Exercice[] | undefined;
  /** Exercices déjà dans la séance, à ne pas proposer. */
  exclus: ReadonlySet<string>;
  onChoisir: (exerciceId: string, aussiSeance: boolean) => void;
  onFermer: () => void;
}

/** "Machine prise" : propose des équivalents (même muscle, même zone, dans ma salle). */
export function FeuilleRemplacement({ ouverte, depart, catalogue, exclus, onChoisir, onFermer }: Props) {
  const [aussiSeance, setAussiSeance] = useState(false);
  const liste = depart && catalogue ? equivalents(depart, catalogue, exclus) : [];
  const memeZone = liste.some((e) => e.memeZone);

  return (
    <Feuille ouverte={ouverte} onFermer={onFermer} titre="Remplacer l’exercice">
      {depart && (
        <p>
          {memeZone
            ? `Équivalents pour « ${libelleZone(depart.musclePrincipal, depart.zone).toLowerCase()} », disponibles dans ta salle :`
            : liste.length
              ? 'Pas d’autre exercice pour cette zone précise : voici des exercices pour le même muscle.'
              : 'Aucun équivalent disponible dans ta salle pour ce muscle.'}
        </p>
      )}
      <ul className="carte liste-exercices liste-remplacement">
        {liste.map(({ exercice: e }) => (
          <li key={e.id} className="ligne-exercice">
            <button type="button" className="ligne-exercice-lien" onClick={() => onChoisir(e.id, aussiSeance)}>
              <MiniatureExercice exerciceId={e.id} />
              <span className="ligne-exercice-texte">
                <span className="ligne-exercice-nom">{e.nom}</span>
                <span className="ligne-exercice-meta">
                  {libelleType(e.type)} · {e.mouvement.articulation === 'polyarticulaire' ? 'poly' : 'isolation'}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="ligne remplacement-option">
        <div className="libelle">
          Aussi pour les prochaines fois
          <small>Remplace aussi l’exercice dans la séance type</small>
        </div>
        <Interrupteur libelle="Aussi pour les prochaines fois" actif={aussiSeance} onChange={setAussiSeance} />
      </div>
      <div className="actions">
        <button type="button" className="bouton large" onClick={onFermer}>
          Annuler
        </button>
      </div>
    </Feuille>
  );
}
