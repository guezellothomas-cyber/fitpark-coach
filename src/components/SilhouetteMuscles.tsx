/**
 * Silhouette dessinée pour l'app (face et dos), dont les muscles se colorient.
 * Chaque vue est dessinée pour la moitié gauche du corps puis recopiée en miroir.
 * Repère : 100 de large × 200 de haut par vue, axe du corps à x = 50.
 */
import { libelleMuscle, type MuscleId } from '../data/muscles';
import { REGIONS_DOS, REGIONS_FACE, muscleDeRegion, type CarteRegions, type Region } from '../data/regions';

/** Formes des muscles (moitié gauche). */
const FORMES: Record<Region, string> = {
  // ----- Face -----
  'trap-face': 'M44,27 L35.5,32.5 L45,32.5 Z',
  'delt-avant': 'M35,32 C29,32 25,36 24,44 C24,48 25,51 26,53 C28,48 31,44 36,41 C37.5,38 37.5,34 35,32 Z',
  'pec-haut': 'M49,34 L37.5,34 C35.5,37 34.5,40 34.2,43.5 L49,43.5 Z',
  'pec-bas': 'M34.2,43.5 L49,43.5 L49,53 C44,55.5 38,55 34.5,50.5 C34,48 34,45.5 34.2,43.5 Z',
  biceps: 'M26.5,54.5 C24.5,59 23.5,65 24,71 L30,71 C31,65 32.2,59 31.8,53.5 C30,52.5 27.8,52.8 26.5,54.5 Z',
  'avant-bras-face': 'M24,73 C22,80 21,88 21,95 L26,95 C27,88 29,80 30.2,73 Z',
  obliques: 'M34.6,52.5 C37.5,55.5 40.5,56.5 43,57 L43,82 L37.5,80 C35.5,72 34.6,62 34.6,52.5 Z',
  'abdos-droit': 'M44,56.5 L49,56.5 L49,84.5 L44,83.5 Z',
  quadriceps: 'M36.5,86 C33.5,98 33.5,116 37,136 L44,136 C44,122 45,108 46,98.5 C43,94 39.5,90 36.5,86 Z',
  adducteurs: 'M46.6,99.5 L49.2,100.5 L48.2,114 C47.4,121 46.4,127.5 45,134 C45,122 45.6,110 46.6,99.5 Z',
  'mollets-face': 'M36.2,145 C34.4,157 35.2,170 38,182 L43,182 C44,170 44.8,157 44,145 Z',
  // Brachio-radial : bande sur le dessus de l'avant-bras, près du coude
  'brachio-radial': 'M24,73 C23,77 22.4,81 22,86 L24.8,86 C25.6,81 26.6,77 27.6,73 Z',
  // ----- Dos -----
  trap: 'M50,21 L44.5,29.5 L36,33 L43,36.5 L50,53 Z',
  'delt-arriere': 'M35,32 C29,32 25,36 24,44 C24,48 25,51 26,53 C28,48 31,44 36,41 C37.5,38 37.5,34 35,32 Z',
  dos: 'M38.2,38 C42.5,41 46.5,47 49,55 L49,66 L45,70 C40,64 36,56 34.5,47.5 C34.4,43.5 36,40.2 38.2,38 Z',
  lombaires: 'M45.4,70.6 L49,67 L49,84 L44.2,84 C44,79 44.4,74.5 45.4,70.6 Z',
  triceps: 'M26.5,54.5 C24.5,59 23.5,65 24,71 L30,71 C31,65 32.2,59 31.8,53.5 C30,52.5 27.8,52.8 26.5,54.5 Z',
  'avant-bras-dos': 'M24,73 C22,80 21,88 21,95 L26,95 C27,88 29,80 30.2,73 Z',
  fessiers: 'M37.2,85 C35.2,91 35.4,98.5 38.5,102.5 C42,104.5 46,104.5 49,102.5 L49,86.5 L44,85.5 Z',
  ischios: 'M36.4,104.5 C34.6,114 35.4,126 38,136 L45,136 C46,126 47,114 48,105 C44,106.2 40,106 36.4,104.5 Z',
  mollets: 'M36.4,144.5 C33.6,152 34.4,162 37.2,170 L44,170 C45,162 45.6,152 44,144.5 Z',
};

/** Contour complet de la moitié du corps, dessiné sous les muscles pour combler les jointures. */
const CONTOUR =
  'M50,23 L45,23 L44,30 C40,31 34,31 30,33 C26,35 24,40 23.6,46 C23,54 23,62 23.4,70 ' +
  'C22,80 20.6,88 20.6,96 L20.4,103 C21,106 25,106 26.4,102 L26.4,95 C28,88 30,80 30.8,72 ' +
  'C31.4,64 32.6,57 33.8,52 C34.2,62 35.2,72 36.8,82 C35.4,90 33.4,100 33.6,114 ' +
  'C33.8,124 35.4,132 36,140 C34.2,150 34.4,166 37.4,183 L34,193 L45,193 L43.8,183 ' +
  'C45,170 45.6,156 44.8,144 C46,132 47.8,116 49.4,101 L50,100.5 Z';

/** Parties non musculaires (tête, mains, genoux, pieds…), toujours en gris. */
const BASE_COMMUNE = [
  'M45,24 L55,24 L56,33 L44,33 Z', // cou
  'M37,81 L49,85 L49,100 L46.5,100 C42.5,96 39.5,90 37,84 Z', // bassin
  'M23.2,96 C20.6,97 20.4,103 22.4,105 C24.8,106 26.6,102 26.2,97 Z', // main
];
const BASE_FACE = [
  'M37.6,137 C35.6,138.5 35.6,142.5 37.4,144.5 L43.6,144.5 C45.4,142.5 45.4,138.5 43.4,137 Z', // genou
  'M37.6,183 L43.4,183 L45,193 L34,193 C34,189 35.6,185.5 37.6,183 Z', // pied
];
const BASE_DOS = [
  'M37.6,137 C35.6,138.5 35.6,142.5 37.4,144.5 L43.6,144.5 C45.4,142.5 45.4,138.5 43.4,137 Z', // creux du genou
  'M37.4,170.5 L43.8,170.5 L43,183 L38.2,183 Z', // tendon d'Achille
  'M37.6,184 L43.4,184 L44,192 L35.6,192 C35.6,189 36.4,186 37.6,184 Z', // talon
];

const VUES = {
  face: { regions: REGIONS_FACE, base: [...BASE_COMMUNE, ...BASE_FACE] },
  dos: { regions: REGIONS_DOS, base: [...BASE_COMMUNE, ...BASE_DOS] },
};

/**
 * "exercice" : rouge vif = principal, rouge clair = secondaires.
 * "volume" : échelle d'une seule teinte, de discrète (peu de séries) à intense (beaucoup).
 */
export type Echelle = 'exercice' | 'volume';

function couleur(intensite: CarteRegions[Region], echelle: Echelle): string {
  if (!intensite) return 'var(--corps)';
  if (echelle === 'volume') return { leger: 'var(--vol-1)', moyen: 'var(--vol-2)', fort: 'var(--vol-3)' }[intensite];
  return intensite === 'leger' ? 'var(--rouge-clair)' : 'var(--rouge-vif)';
}

/** Petits muscles : leur zone tactile passe devant celle des grands. */
const PETITS: ReadonlySet<Region> = new Set([
  'biceps', 'triceps', 'avant-bras-face', 'avant-bras-dos', 'brachio-radial', 'trap-face', 'trap', 'adducteurs',
]);

interface PropsVue {
  vue: 'face' | 'dos';
  carte: CarteRegions;
  decalage: number;
  echelle: Echelle;
  onMuscle?: ((m: MuscleId) => void) | undefined;
}

function Vue({ vue, carte, decalage, echelle, onMuscle }: PropsVue) {
  const { regions, base } = VUES[vue];
  const moitie = (
    <>
      <path d={CONTOUR} fill="var(--corps-fond)" stroke="none" />
      {base.map((d, i) => (
        <path key={`b${i}`} d={d} fill="var(--corps)" />
      ))}
      {regions.map((r) => (
        <path key={r} d={FORMES[r]} fill={couleur(carte[r], echelle)} className={carte[r] ? `muscle-${carte[r]}` : undefined} />
      ))}
    </>
  );
  // Zones tactiles invisibles, plus larges que les muscles : un bras fait à peine 7 px à l'écran.
  const zones = onMuscle && (
    <>
      {[...regions]
        .sort((a, b) => Number(PETITS.has(a)) - Number(PETITS.has(b)))
        .map((r) => (
          <path
            key={r}
            d={FORMES[r]}
            className="zone-muscle"
            fill="transparent"
            stroke="transparent"
            strokeWidth={5}
            role="button"
            aria-label={`Voir les exercices : ${libelleMuscle(muscleDeRegion(r))}`}
            onClick={() => onMuscle(muscleDeRegion(r))}
          />
        ))}
    </>
  );
  return (
    <g transform={`translate(${decalage} 0)`} stroke="var(--contour)" strokeWidth={0.9} strokeLinejoin="round">
      <ellipse cx={50} cy={14} rx={8.5} ry={10.5} fill="var(--corps)" />
      {moitie}
      <g transform="translate(100 0) scale(-1 1)">{moitie}</g>
      {vue === 'face' && (
        // Lignes des abdominaux, pour la lisibilité
        <path d="M44,63 H56 M44,70 H56 M44,77 H56 M50,56.5 V84.5" strokeWidth={0.7} fill="none" />
      )}
      {zones}
      {zones && <g transform="translate(100 0) scale(-1 1)">{zones}</g>}
    </g>
  );
}

interface Props {
  carte: CarteRegions;
  /** "les-deux" = face et dos côte à côte ; sinon une seule vue (miniature). */
  vues?: 'les-deux' | 'face' | 'dos';
  /** Pour une vue seule : cadrer sur le haut du corps, le bas, ou le corps entier. */
  cadrage?: 'entier' | 'haut' | 'bas';
  className?: string;
  titre?: string;
  echelle?: Echelle;
  /** Rend les muscles touchables. */
  onMuscle?: (muscle: MuscleId) => void;
}

const CADRAGES = { entier: '14 0 72 200', haut: '16 2 68 104', bas: '22 80 56 116' } as const;

/** Silhouette coloriée. Rouge vif = muscle principal, rouge clair = muscles secondaires. */
export function SilhouetteMuscles({ carte, vues = 'les-deux', cadrage = 'entier', className, titre, echelle = 'exercice', onMuscle }: Props) {
  const deux = vues === 'les-deux';
  return (
    <svg
      viewBox={deux ? '0 0 210 200' : CADRAGES[cadrage]}
      className={`silhouette ${className ?? ''}`}
      role={onMuscle ? 'group' : 'img'}
      aria-label={titre ?? 'Muscles travaillés'}
    >
      {deux ? (
        <>
          <Vue vue="face" carte={carte} decalage={0} echelle={echelle} onMuscle={onMuscle} />
          <Vue vue="dos" carte={carte} decalage={110} echelle={echelle} onMuscle={onMuscle} />
        </>
      ) : (
        <Vue vue={vues} carte={carte} decalage={0} echelle={echelle} />
      )}
    </svg>
  );
}
