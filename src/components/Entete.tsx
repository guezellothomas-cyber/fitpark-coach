import type { ReactNode } from 'react';

/** Vrai quand l'app est intégrée à Cap (construite avec VITE_DANS_CAP=1) : un bouton ramène à Cap. */
const DANS_CAP = import.meta.env.VITE_DANS_CAP === '1';

/** En-tête d'écran : petit surtitre en couleur d'accent + grand titre condensé. */
export function Entete({ surtitre, titre }: { surtitre?: ReactNode; titre: string }) {
  return (
    <header className="entete">
      {DANS_CAP && (
        <a className="retour-cap" href="../" aria-label="Revenir à Cap">
          ‹ Cap
        </a>
      )}
      {surtitre && <p className="surtitre">{surtitre}</p>}
      <h1>{titre}</h1>
    </header>
  );
}
