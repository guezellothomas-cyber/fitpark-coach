import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Polices embarquées dans l'app (pas de chargement depuis internet)
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';

import './styles/global.css';
import './styles/composants.css';
import './styles/exercices.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
