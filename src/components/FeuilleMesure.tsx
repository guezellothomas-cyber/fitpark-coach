import { useState } from 'react';
import { aujourdhuiISO, enregistrerMesure } from '../db/progres';
import type { Mesure } from '../db/types';
import { Feuille } from './Feuille';
import { Reglette } from './Reglette';

type Champ = 'poids' | 'tourTaille' | 'tourPoitrine' | 'tourBras' | 'tourCuisse';

export const CHAMPS_MESURE: readonly { cle: Champ; libelle: string; unite: string; pas: number; defaut: number }[] = [
  { cle: 'poids', libelle: 'Poids', unite: 'kg', pas: 0.1, defaut: 75 },
  { cle: 'tourTaille', libelle: 'Tour de taille', unite: 'cm', pas: 0.5, defaut: 85 },
  { cle: 'tourPoitrine', libelle: 'Tour de poitrine', unite: 'cm', pas: 0.5, defaut: 100 },
  { cle: 'tourBras', libelle: 'Tour de bras', unite: 'cm', pas: 0.5, defaut: 35 },
  { cle: 'tourCuisse', libelle: 'Tour de cuisse', unite: 'cm', pas: 0.5, defaut: 57 },
];

interface Props {
  ouverte: boolean;
  /** Dernière mesure, pour pré-remplir. */
  derniere: Mesure | undefined;
  onFermer: () => void;
  onEnregistree: () => void;
}

/**
 * Saisie du poids de corps et des mensurations, sans clavier, pré-remplie avec la dernière mesure.
 * Chaque mensuration est facultative : on coche celles qu'on a mesurées aujourd'hui.
 */
export function FeuilleMesure({ ouverte, derniere, onFermer, onEnregistree }: Props) {
  return (
    <Feuille ouverte={ouverte} onFermer={onFermer} titre="Nouvelle mesure">
      {ouverte && <Formulaire derniere={derniere} onEnregistree={onEnregistree} onFermer={onFermer} />}
    </Feuille>
  );
}

function Formulaire({ derniere, onEnregistree, onFermer }: Omit<Props, 'ouverte'>) {
  const [valeurs, setValeurs] = useState<Record<Champ, number>>(() =>
    Object.fromEntries(CHAMPS_MESURE.map((c) => [c.cle, derniere?.[c.cle] ?? c.defaut])) as Record<Champ, number>,
  );
  // Par défaut on mesure le poids ; les mensurations seulement si elles avaient été prises la dernière fois.
  const [actifs, setActifs] = useState<Set<Champ>>(
    () => new Set(CHAMPS_MESURE.filter((c) => c.cle === 'poids' || derniere?.[c.cle] !== undefined).map((c) => c.cle)),
  );

  function basculer(c: Champ) {
    const s = new Set(actifs);
    if (s.has(c)) s.delete(c);
    else s.add(c);
    setActifs(s);
  }

  async function enregistrer() {
    const mesure: Omit<Mesure, 'id'> = { date: aujourdhuiISO() };
    for (const c of actifs) mesure[c] = valeurs[c];
    await enregistrerMesure(mesure);
    onEnregistree();
  }

  return (
    <>
      <p>Mesure du jour. Touche un nom pour l’inclure ou non.</p>
      <div className="reglages-exercice">
        {CHAMPS_MESURE.map((c) => {
          const actif = actifs.has(c.cle);
          return (
            <div key={c.cle} className={`ligne-reglage${actif ? '' : ' inactif'}`}>
              <button type="button" className="case-mesure" aria-pressed={actif} onClick={() => basculer(c.cle)}>
                {c.libelle}
              </button>
              {actif && (
                <Reglette
                  libelle={c.libelle}
                  valeur={valeurs[c.cle]}
                  pas={c.pas}
                  min={0}
                  max={400}
                  unite={c.unite}
                  onChange={(v) => setValeurs({ ...valeurs, [c.cle]: v })}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="actions">
        <button type="button" className="bouton principal large" disabled={actifs.size === 0} onClick={() => void enregistrer()}>
          Enregistrer
        </button>
        <button type="button" className="bouton large" onClick={onFermer}>
          Annuler
        </button>
      </div>
    </>
  );
}
