import { useLayoutEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { BandeauMiseAJour } from './components/BandeauMiseAJour';
import { BarreOnglets } from './components/BarreOnglets';
import { FournisseurMessage } from './components/Message';
import { useReglages } from './db/reglages';
import { useAppliquerTheme } from './lib/theme';
import { AideRaccourci } from './screens/AideRaccourci';
import { AjoutExercice } from './screens/AjoutExercice';
import { ResumeSeance } from './screens/ResumeSeance';
import { SeanceEnCours } from './screens/SeanceEnCours';
import { Aujourdhui } from './screens/Aujourdhui';
import { EditeurSeance } from './screens/EditeurSeance';
import { Exercices } from './screens/Exercices';
import { FicheExercice } from './screens/FicheExercice';
import { Progres } from './screens/Progres';
import { Reglages } from './screens/Reglages';
import { Seances } from './screens/Seances';

/** Position de défilement de chaque écran, pour la retrouver au retour arrière. */
const positionsDefilement = new Map<string, number>();

/** Zone défilante de l'écran courant ; la clé relance l'animation d'entrée à chaque écran. */
function Ecran() {
  const { pathname } = useLocation();
  const typeNavigation = useNavigationType();
  const zone = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = zone.current;
    if (!el) return;
    // Au retour arrière, on revient à l'endroit où on était. Le contenu peut arriver un peu
    // après (lecture de la base) : on réessaie pendant un court instant.
    const cible = typeNavigation === 'POP' ? (positionsDefilement.get(pathname) ?? 0) : 0;
    let essais = 0;
    let image = 0;
    const restaurer = () => {
      el.scrollTop = cible;
      if (el.scrollTop < cible && essais++ < 30) image = requestAnimationFrame(restaurer);
    };
    restaurer();
    const memoriser = () => positionsDefilement.set(pathname, el.scrollTop);
    el.addEventListener('scroll', memoriser, { passive: true });
    return () => {
      cancelAnimationFrame(image);
      el.removeEventListener('scroll', memoriser);
    };
  }, [pathname, typeNavigation]);

  return (
    <main className="ecran" key={pathname} ref={zone}>
      <Routes>
        <Route path="/" element={<Aujourdhui />} />
        <Route path="/seances" element={<Seances />} />
        <Route path="/seances/:id" element={<EditeurSeance />} />
        <Route path="/seances/:id/ajouter" element={<AjoutExercice />} />
        <Route path="/exercices" element={<Exercices />} />
        <Route path="/exercices/:id" element={<FicheExercice />} />
        <Route path="/progres" element={<Progres />} />
        <Route path="/reglages" element={<Reglages />} />
        <Route path="/aide/raccourci" element={<AideRaccourci />} />
        <Route path="/seance" element={<SeanceEnCours />} />
        <Route path="/seance/resume/:id" element={<ResumeSeance />} />
      </Routes>
    </main>
  );
}

/** Pendant une séance en salle, la barre d'onglets est masquée : tout l'écran sert à la saisie. */
function BarreOngletsHorsSeance() {
  const { pathname } = useLocation();
  return pathname === '/seance' ? null : <BarreOnglets />;
}

export function App() {
  const { theme } = useReglages();
  useAppliquerTheme(theme);

  // HashRouter : les adresses internes sont du type .../#/reglages.
  // C'est ce qui fonctionne le mieux sur GitHub Pages et en mode hors connexion.
  return (
    <HashRouter>
      <FournisseurMessage>
        <div className="app">
          {/* Bande opaque sous la Dynamic Island : le contenu défile dessous sans se mélanger à l'heure */}
          <div className="cache-haut" aria-hidden="true" />
          <BandeauMiseAJour />
          <Ecran />
          <BarreOngletsHorsSeance />
        </div>
      </FournisseurMessage>
    </HashRouter>
  );
}
