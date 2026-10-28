/**
 * Icônes dessinées pour l'app (traits de 2 px sur une grille de 24).
 * Elles prennent la couleur du texte autour (currentColor).
 */
import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { taille?: number };

function Svg({ taille = 26, children, ...reste }: Props) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...reste}
    >
      {children}
    </svg>
  );
}

/** Aujourd'hui : un éclair dans un cercle (la séance du jour). */
export function IconeAujourdhui(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M13 6.5 9.5 12.5h4L11 17.5" />
    </Svg>
  );
}

/** Séances : une liste d'exercices. */
export function IconeSeances(p: Props) {
  return (
    <Svg {...p}>
      <rect x="4" y="3.5" width="16" height="17" rx="3" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </Svg>
  );
}

/** Exercices : un haltère. */
export function IconeExercices(p: Props) {
  return (
    <Svg {...p}>
      <path d="M8 12h8" />
      <rect x="4.5" y="7" width="3.5" height="10" rx="1.2" />
      <rect x="16" y="7" width="3.5" height="10" rx="1.2" />
      <path d="M2.5 10v4M21.5 10v4" />
    </Svg>
  );
}

/** Progrès : une courbe qui monte. */
export function IconeProgres(p: Props) {
  return (
    <Svg {...p}>
      <path d="M3.5 19.5h17" />
      <path d="m4.5 15 4.5-4.5 3.5 3 7-7" />
      <path d="M15 6.5h4.5V11" />
    </Svg>
  );
}

/** Réglages : deux curseurs. */
export function IconeReglages(p: Props) {
  return (
    <Svg {...p}>
      <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
      <circle cx="15" cy="8" r="2.2" />
      <circle cx="9" cy="16" r="2.2" />
    </Svg>
  );
}

export function IconePlus(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconeMoins(p: Props) {
  return (
    <Svg {...p}>
      <path d="M5 12h14" />
    </Svg>
  );
}

export function IconeExporter(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </Svg>
  );
}

export function IconeImporter(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 4v11M8 11l4 4 4-4" />
      <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </Svg>
  );
}

export function IconeRecherche(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Svg>
  );
}

export function IconeCroix(p: Props) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function IconeCoche(p: Props) {
  return (
    <Svg {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function IconeRetour(p: Props) {
  return (
    <Svg {...p}>
      <path d="M15 5 8 12l7 7" />
    </Svg>
  );
}

export function IconeChevron(p: Props) {
  return (
    <Svg {...p}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

/** Poignée de glisser-déposer : six points. */
export function IconePoignee(p: Props) {
  return (
    <Svg {...p} strokeWidth={3}>
      <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
    </Svg>
  );
}

/** Superset : deux maillons. */
export function IconeLien(p: Props) {
  return (
    <Svg {...p}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </Svg>
  );
}

/** Le guide : une étincelle. */
export function IconeGuide(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </Svg>
  );
}

export function IconeTri(p: Props) {
  return (
    <Svg {...p}>
      <path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M14 6h7M14 12h5M14 18h3" />
    </Svg>
  );
}

/** Voir le geste : bouton lecture dans un cercle. */
export function IconeLecture(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5v7l5.5-3.5z" />
    </Svg>
  );
}

/** Remplacer : deux flèches opposées. */
export function IconeEchange(p: Props) {
  return (
    <Svg {...p}>
      <path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" />
    </Svg>
  );
}

/** Échauffement : une flamme. */
export function IconeFlamme(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.3-5.4 3.7-7.6.5 1.6 1.4 2.6 2.5 3.1-.2-2.9.9-5.6 3-7.3.3 2.9 1.8 4.6 3.1 6.4.9 1.3 1.7 2.8 1.7 4.9 0 4-2.7 6.7-7.5 6.7Z" />
    </Svg>
  );
}

/** Progression : une flèche vers le haut. */
export function IconeHausse(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Svg>
  );
}

export function IconeChantier(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4M12 17v.01" />
    </Svg>
  );
}
