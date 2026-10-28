interface Props {
  actif: boolean;
  onChange: (actif: boolean) => void;
  libelle: string;
}

/** Interrupteur marche / arrêt, façon iPhone. */
export function Interrupteur({ actif, onChange, libelle }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={libelle}
      className="interrupteur"
      onClick={() => onChange(!actif)}
    >
      <span className="interrupteur-curseur" />
    </button>
  );
}
