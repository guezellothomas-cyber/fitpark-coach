import { NavLink } from 'react-router-dom';
import {
  IconeAujourdhui,
  IconeExercices,
  IconeProgres,
  IconeReglages,
  IconeSeances,
} from './Icones';

const ONGLETS = [
  { vers: '/', libelle: "Aujourd'hui", Icone: IconeAujourdhui },
  { vers: '/seances', libelle: 'Séances', Icone: IconeSeances },
  { vers: '/exercices', libelle: 'Exercices', Icone: IconeExercices },
  { vers: '/progres', libelle: 'Progrès', Icone: IconeProgres },
  { vers: '/reglages', libelle: 'Réglages', Icone: IconeReglages },
] as const;

/** Barre d'onglets fixée en bas, au-dessus de la barre d'accueil de l'iPhone. */
export function BarreOnglets() {
  return (
    <nav className="barre-onglets" aria-label="Navigation principale">
      {ONGLETS.map(({ vers, libelle, Icone }) => (
        <NavLink key={vers} to={vers} end={vers === '/'} className="onglet">
          <span className="onglet-icone">
            <Icone taille={25} />
          </span>
          <span className="onglet-libelle">{libelle}</span>
        </NavLink>
      ))}
    </nav>
  );
}
