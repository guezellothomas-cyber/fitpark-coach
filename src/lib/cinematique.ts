/**
 * Petit moteur d'animation du personnage.
 * Une pose = la position des articulations (hanche, épaule, coude, main, genou, cheville, orteils).
 * Pour passer d'une pose à l'autre, on ne déplace pas les points en ligne droite (les membres
 * rétréciraient) : on fait tourner chaque segment autour de son articulation, comme un vrai bras.
 */

export type Point = readonly [number, number];

/** Articulations. Le suffixe 2 = l'autre côté (bras / jambe du fond, ou côté droit vu de face). */
export interface Pose {
  H: Point; // hanche
  S: Point; // épaule
  E: Point; // coude
  M: Point; // main
  G: Point; // genou
  C: Point; // cheville
  O?: Point; // orteils
  H2?: Point;
  S2?: Point;
  E2?: Point;
  M2?: Point;
  G2?: Point;
  C2?: Point;
  O2?: Point;
  /** Bout des doigts : seulement pour les gestes où le poignet bouge (M est alors le poignet). */
  D?: Point;
  D2?: Point;
}

export type PoseComplete = Required<Omit<Pose, 'D' | 'D2'>> & Pick<Pose, 'D' | 'D2'>;
export type Vue = 'profil' | 'face';

/** Axe de symétrie du corps vu de face. */
export const AXE = 80;
/** Décalage des membres du fond, vus de profil (effet de profondeur). */
const FOND: Point = [-2.5, -1.5];

const plus = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];
const miroir = (p: Point): Point => [2 * AXE - p[0], p[1]];

/** Complète une pose : membres du fond (profil) ou côté droit en miroir (face), orteils. */
export function completer(p: Pose, vue: Vue): PoseComplete {
  if (vue === 'profil') {
    const O = p.O ?? plus(p.C, [8, 0]);
    return {
      ...p,
      O,
      H2: p.H2 ?? p.H,
      S2: p.S2 ?? p.S,
      E2: p.E2 ?? plus(p.E, FOND),
      M2: p.M2 ?? plus(p.M, FOND),
      G2: p.G2 ?? plus(p.G, FOND),
      C2: p.C2 ?? plus(p.C, FOND),
      O2: p.O2 ?? (p.C2 ? plus(p.C2, [8, 0]) : plus(O, FOND)),
      D2: p.D2 ?? (p.D ? plus(p.D, FOND) : undefined),
    };
  }
  const O = p.O ?? plus(p.C, [-5, 0]);
  const C2 = p.C2 ?? miroir(p.C);
  return {
    ...p,
    O,
    H2: p.H2 ?? miroir(p.H),
    S2: p.S2 ?? miroir(p.S),
    E2: p.E2 ?? miroir(p.E),
    M2: p.M2 ?? miroir(p.M),
    G2: p.G2 ?? miroir(p.G),
    C2,
    O2: p.O2 ?? plus(C2, [5, 0]),
    D2: p.D2 ?? (p.D ? miroir(p.D) : undefined),
  };
}

/** Segments du squelette : [articulation, articulation parente]. L'ordre compte (parents d'abord). */
export const SEGMENTS: readonly (readonly [keyof PoseComplete, keyof PoseComplete])[] = [
  ['S', 'H'],
  ['E', 'S'],
  ['M', 'E'],
  ['G', 'H'],
  ['C', 'G'],
  ['O', 'C'],
  ['S2', 'H2'],
  ['E2', 'S2'],
  ['M2', 'E2'],
  ['G2', 'H2'],
  ['C2', 'G2'],
  ['O2', 'C2'],
];

/** Mains : seulement quand le geste décrit le poignet. */
const SEGMENTS_MAINS = [
  ['D', 'M'],
  ['D2', 'M2'],
] as const;

function polaire(de: Point, vers: Point) {
  const dx = vers[0] - de[0];
  const dy = vers[1] - de[1];
  return { angle: Math.atan2(dy, dx), longueur: Math.hypot(dx, dy) };
}

/** Angle intermédiaire par le plus court chemin. */
function melangerAngle(a: number, b: number, t: number): number {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}

const melanger = (a: number, b: number, t: number) => a + (b - a) * t;

/** Pose intermédiaire entre A (t = 0) et B (t = 1). */
export function interpoler(A: PoseComplete, B: PoseComplete, t: number): PoseComplete {
  const r: Record<string, Point> = {
    H: [melanger(A.H[0], B.H[0], t), melanger(A.H[1], B.H[1], t)],
    H2: [melanger(A.H2[0], B.H2[0], t), melanger(A.H2[1], B.H2[1], t)],
  };
  for (const [enfant, parent] of [...SEGMENTS, ...SEGMENTS_MAINS]) {
    const debut = A[enfant];
    const fin = B[enfant];
    if (!debut || !fin) continue;
    const a = polaire(A[parent]!, debut);
    const b = polaire(B[parent]!, fin);
    const angle = melangerAngle(a.angle, b.angle, t);
    const longueur = melanger(a.longueur, b.longueur, t);
    const p = r[parent]!;
    r[enfant] = [p[0] + Math.cos(angle) * longueur, p[1] + Math.sin(angle) * longueur];
  }
  return r as unknown as PoseComplete;
}

/** Position de la tête. */
export function tete(p: PoseComplete, vue: Vue): Point {
  if (vue === 'face') return [(p.S[0] + p.S2[0]) / 2, Math.min(p.S[1], p.S2[1]) - 12];
  const { angle } = polaire(p.H, p.S);
  return [p.S[0] + Math.cos(angle) * 9, p.S[1] + Math.sin(angle) * 9];
}

/** Longueur d'un segment (utilisée par les tests de cohérence des poses). */
export function longueur(p: PoseComplete, enfant: keyof PoseComplete, parent: keyof PoseComplete): number {
  return polaire(p[parent]!, p[enfant]!).longueur;
}

/**
 * Rythme d'une répétition, sur un cycle de 3,4 s :
 * pause, phase concentrique rapide (A → B), pause, phase excentrique lente (B → A), pause.
 * Renvoie t entre 0 (pose A) et 1 (pose B).
 */
export const DUREE_CYCLE = 3400;
export function progression(ms: number): number {
  const x = (ms % DUREE_CYCLE) / DUREE_CYCLE;
  const doux = (u: number) => u * u * (3 - 2 * u);
  if (x < 0.08) return 0;
  if (x < 0.36) return doux((x - 0.08) / 0.28);
  if (x < 0.46) return 1;
  if (x < 0.92) return 1 - doux((x - 0.46) / 0.46);
  return 0;
}
