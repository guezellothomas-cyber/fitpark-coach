import type { ReactNode } from 'react';

/** En-tête d'écran : petit surtitre en couleur d'accent + grand titre condensé. */
export function Entete({ surtitre, titre }: { surtitre?: ReactNode; titre: string }) {
  return (
    <header className="entete">
      {surtitre && <p className="surtitre">{surtitre}</p>}
      <h1>{titre}</h1>
    </header>
  );
}
