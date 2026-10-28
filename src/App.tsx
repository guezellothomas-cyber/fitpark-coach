import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { BandeauMiseAJour } from './components/BandeauMiseAJour';
import { BarreOnglets } from './components/BarreOnglets';
import { FournisseurMessage } from './components/Message';
import { useReglages } from './db/reglages';
import { useAppliquerTheme } from './lib/theme';
import { Aujourdhui } from './screens/Aujourdhui';
import { Exercices } from './screens/Exercices';
import { Progres } from './screens/Progres';
import { Reglages } from './screens/Reglages';
import { Seances } from './screens/Seances';

/** Zone défilante de l'écran courant ; la clé relance l'animation d'entrée à chaque onglet. */
function Ecran() {
  const { pathname } = useLocation();
  return (
    <main className="ecran" key={pathname}>
      <Routes>
        <Route path="/" element={<Aujourdhui />} />
        <Route path="/seances" element={<Seances />} />
        <Route path="/exercices" element={<Exercices />} />
        <Route path="/progres" element={<Progres />} />
        <Route path="/reglages" element={<Reglages />} />
      </Routes>
    </main>
  );
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
          <BandeauMiseAJour />
          <Ecran />
          <BarreOnglets />
        </div>
      </FournisseurMessage>
    </HashRouter>
  );
}
