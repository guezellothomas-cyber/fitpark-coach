import { useLocation, useNavigate } from 'react-router-dom';
import { IconeRetour } from './Icones';

/**
 * Bouton retour en haut à gauche. Revient à l'écran précédent (filtres et position conservés)
 * ou, si l'app a été ouverte directement sur cette page, va à `repli`.
 */
export function BoutonRetour({ libelle, repli }: { libelle: string; repli: string }) {
  const naviguer = useNavigate();
  const location = useLocation();
  return (
    <button
      type="button"
      className="bouton-retour"
      onClick={() => (location.key !== 'default' ? naviguer(-1) : naviguer(repli, { replace: true }))}
    >
      <IconeRetour taille={22} />
      {libelle}
    </button>
  );
}
