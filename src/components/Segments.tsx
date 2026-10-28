import type { CSSProperties } from 'react';

interface Option<T extends string> {
  valeur: T;
  libelle: string;
}

interface Props<T extends string> {
  options: readonly Option<T>[];
  valeur: T;
  onChange: (v: T) => void;
  libelle: string;
}

/** Choix exclusif entre quelques options (ex. Sombre / Clair / Auto). */
export function Segments<T extends string>({ options, valeur, onChange, libelle }: Props<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.valeur === valeur),
  );
  return (
    <div
      className="segments"
      role="radiogroup"
      aria-label={libelle}
      style={{ '--n': options.length, '--i': index } as CSSProperties}
    >
      <span className="segments-pastille" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.valeur}
          type="button"
          role="radio"
          aria-checked={o.valeur === valeur}
          className="segments-option"
          onClick={() => onChange(o.valeur)}
        >
          {o.libelle}
        </button>
      ))}
    </div>
  );
}
