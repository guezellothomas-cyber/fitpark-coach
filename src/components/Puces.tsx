import { useLayoutEffect, useRef, type ReactNode } from 'react';

interface Option<T extends string> {
  valeur: T;
  libelle: ReactNode;
}

interface Props<T extends string> {
  options: readonly Option<T>[];
  valeur: T;
  onChange: (v: T) => void;
  libelle: string;
}

/** Rangée de pastilles défilante horizontalement, une seule sélectionnée à la fois. */
export function Puces<T extends string>({ options, valeur, onChange, libelle }: Props<T>) {
  const rangee = useRef<HTMLDivElement>(null);

  // Fait défiler la rangée pour que la pastille choisie soit visible (ex. au retour d'une fiche).
  useLayoutEffect(() => {
    const el = rangee.current;
    const choisie = el?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!el || !choisie) return;
    const gauche = choisie.offsetLeft - el.offsetLeft;
    if (gauche < el.scrollLeft || gauche + choisie.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollLeft = gauche - 18;
    }
  }, [valeur]);

  return (
    <div className="puces" role="radiogroup" aria-label={libelle} ref={rangee}>
      {options.map((o) => (
        <button
          key={o.valeur}
          type="button"
          role="radio"
          aria-checked={o.valeur === valeur}
          className="puce"
          onClick={() => onChange(o.valeur)}
        >
          {o.libelle}
        </button>
      ))}
    </div>
  );
}
