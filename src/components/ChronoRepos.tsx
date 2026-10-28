import type { CSSProperties } from 'react';
import { formatDuree } from '../lib/format';

interface Props {
  /** Secondes restantes. */
  reste: number;
  /** Durée totale du repos en secondes. */
  total: number;
  ensuite: string;
  onAjuster: (secondes: number) => void;
  onPasser: () => void;
}

/** Chrono de repos : temps restant en très grand, barre qui se vide, réglage ±15 s. */
export function ChronoRepos({ reste, total, ensuite, onAjuster, onPasser }: Props) {
  const progression = total > 0 ? Math.min(1, Math.max(0, reste / total)) : 0;
  const fin = reste <= 10;
  return (
    <div className={`chrono${fin ? ' bientot' : ''}`} role="timer" aria-live="off">
      <div className="chrono-barre" style={{ '--p': progression } as CSSProperties} />
      <div className="chrono-ligne">
        <button type="button" className="chrono-ajuster" onClick={() => onAjuster(-15)} aria-label="Retirer 15 secondes">
          −15
        </button>
        <div className="chrono-centre">
          <span className="chrono-titre">Repos</span>
          <span className="chrono-temps chiffres">{formatDuree(Math.ceil(reste))}</span>
        </div>
        <button type="button" className="chrono-ajuster" onClick={() => onAjuster(15)} aria-label="Ajouter 15 secondes">
          +15
        </button>
      </div>
      <div className="chrono-bas">
        <span className="chrono-ensuite">Ensuite : {ensuite}</span>
        <button type="button" className="bouton" onClick={onPasser}>
          Passer
        </button>
      </div>
    </div>
  );
}
