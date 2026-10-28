import { formatNombre } from '../lib/format';
import { IconeMoins, IconePlus } from './Icones';

interface Props {
  valeur: number;
  onChange: (v: number) => void;
  pas: number;
  min?: number;
  max?: number;
  /** Unité affichée après le nombre (kg, s…). */
  unite?: string;
  /** Formatage personnalisé de la valeur (ex. durée 1:30). */
  formater?: (v: number) => string;
  libelle: string;
  /** Version géante pour l'écran de séance (chiffres très lisibles, boutons plus gros). */
  grande?: boolean;
}

/**
 * Réglage d'une valeur par gros boutons − et +, sans clavier.
 * C'est la brique de base de la saisie des charges et des répétitions.
 */
export function Reglette({
  valeur,
  onChange,
  pas,
  min = 0,
  max = Infinity,
  unite,
  formater = formatNombre,
  libelle,
  grande = false,
}: Props) {
  // Arrondi pour éviter les erreurs de calcul du type 0,1 + 0,2 = 0,30000000000000004
  const arrondir = (v: number) => Math.round(v * 100) / 100;
  const changer = (delta: number) => {
    const v = arrondir(Math.min(max, Math.max(min, valeur + delta)));
    if (v !== valeur) {
      onChange(v);
      navigator.vibrate?.(8); // petit retour tactile (sans effet sur iPhone, ignoré)
    }
  };

  return (
    <div className={`reglette${grande ? ' grande' : ''}`} role="group" aria-label={libelle}>
      <button
        type="button"
        className="reglette-bouton"
        onClick={() => changer(-pas)}
        disabled={valeur <= min}
        aria-label={`Diminuer ${libelle}`}
      >
        <IconeMoins taille={grande ? 30 : 22} />
      </button>
      <output className="reglette-valeur chiffres" aria-live="polite">
        {formater(valeur)}
        {unite && <span className="reglette-unite">{unite}</span>}
      </output>
      <button
        type="button"
        className="reglette-bouton"
        onClick={() => changer(pas)}
        disabled={valeur >= max}
        aria-label={`Augmenter ${libelle}`}
      >
        <IconePlus taille={grande ? 30 : 22} />
      </button>
    </div>
  );
}
