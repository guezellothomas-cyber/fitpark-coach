import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  ouverte: boolean;
  onFermer: () => void;
  titre: string;
  children: ReactNode;
}

/**
 * Panneau qui monte depuis le bas de l'écran (à portée de pouce),
 * utilisé pour les confirmations et les choix.
 */
export function Feuille({ ouverte, onFermer, titre, children }: Props) {
  // Fermer avec la touche Échap (utile sur ordinateur).
  useEffect(() => {
    if (!ouverte) return;
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [ouverte, onFermer]);

  if (!ouverte) return null;
  return createPortal(
    <div className="feuille-voile" onClick={onFermer}>
      <div
        className="feuille"
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="feuille-poignee" aria-hidden="true" />
        <h2 className="feuille-titre">{titre}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
