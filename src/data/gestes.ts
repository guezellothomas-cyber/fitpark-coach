/**
 * Gestes animés des exercices.
 * Chaque "motif" décrit un geste type par deux poses : A (départ) et B (fin de la phase d'effort).
 * Repère : 160 de large, sol à y = 110, personnage tourné vers la droite (vue de profil)
 * ou de face (seul le côté gauche est décrit, le droit est en miroir sauf mention).
 *
 * Longueurs de référence : tronc 32, bras 17, avant-bras 15, cuisse 24, jambe 24.
 */
import type { Point, Pose, Vue } from '../lib/cinematique';

/** Formes du décor (banc, siège, barre…). */
export type Forme =
  | { rect: readonly [number, number, number, number] }
  | { ligne: readonly [number, number, number, number]; epaisseur?: number }
  | { cercle: readonly [number, number, number] };

export interface Motif {
  vue: Vue;
  A: Pose;
  B: Pose;
  decor?: Forme[];
  /** Point d'attache du câble pour le matériel "poulie". */
  ancre?: Point;
  /** Dessiner le sol (vrai par défaut). */
  sol?: boolean;
}

export type Materiel =
  | 'barre' // barre vue de profil : un disque aux mains
  | 'halteres'
  | 'poulie' // câble des mains vers l'ancre
  | 'poulie-cheville' // câble de la cheville vers l'ancre
  | 'machine' // poignées
  | 'smith' // barre guidée sur rail
  | 'rouleau' // boudin contre la cheville
  | 'plateau' // plateau de presse sous les pieds
  | 'epaule' // charge posée sur les épaules
  | 'hanches' // charge posée sur les hanches
  | 'genoux' // coussins contre les genoux
  | 'roue'
  | 'aucun';

// ───────── Poses de base ─────────
const JAMBES_DEBOUT = { H: [80, 62], G: [81, 86], C: [80, 110], O: [89, 110] } as const;
const DEBOUT: Pose = { ...JAMBES_DEBOUT, S: [80, 30], E: [81, 47], M: [82, 62] };
/** Debout, une jambe en avant (poulies). */
const FENTE_LEGERE = {
  H: [80, 62], G: [88, 85], C: [90, 109], O: [98, 110], G2: [74, 85], C2: [69, 109], O2: [77, 110],
} as const;
const COUCHE = { H: [100, 74], S: [68, 74], G: [119, 88], C: [117, 110], O: [125, 110] } as const;
const ASSIS = { H: [62, 88], S: [62, 56], G: [86, 90], C: [86, 110], O: [94, 110] } as const;
const PENCHE = { H: [74, 60], S: [104, 49], G: [88, 82], C: [84, 108], O: [92, 110] } as const;
const FACE = { H: [72, 62], S: [66, 30], G: [72, 86], C: [72, 110] } as const;

// ───────── Décors ─────────
const BANC_PLAT: Forme[] = [{ rect: [44, 79, 68, 5] }, { rect: [50, 84, 4, 26] }, { rect: [102, 84, 4, 26] }];
const BANC_INCLINE: Forme[] = [
  { ligne: [64, 70, 103, 86], epaisseur: 5 },
  { rect: [96, 85, 24, 5] },
  { ligne: [106, 90, 106, 110], epaisseur: 3 },
];
const SIEGE_DOSSIER: Forme[] = [
  { ligne: [56, 34, 56, 92], epaisseur: 5 },
  { rect: [54, 90, 34, 5] },
  { ligne: [72, 95, 72, 110], epaisseur: 3 },
];
const SIEGE: Forme[] = [{ rect: [52, 90, 34, 5] }, { ligne: [68, 95, 68, 110], epaisseur: 3 }];
const BARRE_FIXE: Forme[] = [{ ligne: [46, 6, 114, 6], epaisseur: 3 }];

export const MOTIFS = {
  // ─── Poussée pectoraux ───
  'developpe-couche': {
    vue: 'profil', decor: BANC_PLAT,
    A: { ...COUCHE, E: [76, 89], M: [74, 74] },
    B: { ...COUCHE, E: [69, 57], M: [70, 42] },
  },
  'developpe-incline': {
    vue: 'profil', decor: BANC_INCLINE,
    A: { H: [100, 80], S: [72, 64], G: [122, 88], C: [120, 110], E: [80, 79], M: [78, 64] },
    B: { H: [100, 80], S: [72, 64], G: [122, 88], C: [120, 110], E: [70, 47], M: [69, 32] },
  },
  'ecarte-couche': {
    vue: 'profil', decor: BANC_PLAT,
    A: { ...COUCHE, E: [69, 91], M: [70, 106] },
    B: { ...COUCHE, E: [69, 57], M: [70, 42] },
  },
  pompes: {
    vue: 'profil',
    A: { H: [94, 89], S: [64, 78], E: [64, 95], M: [64, 110], G: [117, 98], C: [140, 106], O: [142, 111] },
    B: { H: [94, 101], S: [62, 97], E: [78, 100], M: [66, 109], G: [118, 104], C: [142, 107], O: [143, 111] },
  },
  dips: {
    vue: 'profil',
    decor: [{ rect: [48, 54, 48, 3] }, { rect: [56, 57, 3, 53] }, { rect: [88, 57, 3, 53] }],
    A: { S: [77, 23], E: [78, 40], M: [78, 55], H: [79, 55], G: [73, 77], C: [84, 96], O: [90, 101] },
    B: { S: [74, 39], E: [63, 52], M: [78, 55], H: [77, 71], G: [71, 93], C: [84, 108], O: [91, 111] },
  },
  'presse-assise': {
    vue: 'profil', decor: SIEGE_DOSSIER,
    A: { ...ASSIS, E: [46, 62], M: [61, 58] },
    B: { ...ASSIS, E: [79, 57], M: [94, 57] },
  },
  'presse-assise-inclinee': {
    vue: 'profil', decor: SIEGE_DOSSIER,
    A: { ...ASSIS, E: [46, 62], M: [61, 58] },
    B: { ...ASSIS, E: [77, 48], M: [90, 40] },
  },
  'ecarte-assis': {
    vue: 'profil', decor: SIEGE_DOSSIER,
    A: { ...ASSIS, E: [46, 54], M: [32, 58] },
    B: { ...ASSIS, E: [78, 55], M: [93, 57] },
  },
  'ecarte-poulie-haute': {
    vue: 'profil', ancre: [30, -8],
    A: { ...FENTE_LEGERE, S: [87, 31], E: [78, 17], M: [67, 7] },
    B: { ...FENTE_LEGERE, S: [87, 31], E: [98, 44], M: [104, 58] },
  },
  'ecarte-poulie-basse': {
    vue: 'profil', ancre: [28, 108],
    A: { ...FENTE_LEGERE, S: [87, 31], E: [76, 44], M: [66, 55] },
    B: { ...FENTE_LEGERE, S: [87, 31], E: [102, 24], M: [112, 13] },
  },
  crossover: {
    vue: 'profil', ancre: [14, 30],
    A: { ...FENTE_LEGERE, S: [87, 31], E: [71, 30], M: [57, 33] },
    B: { ...FENTE_LEGERE, S: [87, 31], E: [103, 34], M: [117, 38] },
  },

  // ─── Tirage dos ───
  'tirage-vertical': {
    vue: 'profil', ancre: [80, -14],
    decor: [{ rect: [60, 84, 28, 5] }, { ligne: [74, 89, 74, 110], epaisseur: 3 }, { cercle: [94, 79, 4] }],
    A: { H: [70, 84], S: [72, 52], G: [94, 86], C: [93, 110], O: [101, 110], E: [76, 35], M: [79, 20] },
    B: { H: [70, 84], S: [72, 52], G: [94, 86], C: [93, 110], O: [101, 110], E: [64, 67], M: [78, 60] },
  },
  tractions: {
    vue: 'profil', sol: false, decor: BARRE_FIXE,
    A: { M: [80, 8], E: [80, 23], S: [80, 40], H: [80, 72], G: [81, 95], C: [78, 116], O: [84, 120] },
    B: { M: [80, 8], E: [92, 20], S: [78, 26], H: [78, 58], G: [79, 81], C: [77, 101], O: [83, 105] },
  },
  'rowing-assis': {
    vue: 'profil', ancre: [146, 88],
    decor: [{ rect: [46, 90, 32, 5] }, { ligne: [62, 95, 62, 110], epaisseur: 3 }, { ligne: [114, 76, 114, 104], epaisseur: 4 }],
    A: { H: [62, 88], S: [74, 59], E: [90, 63], M: [105, 66], G: [86, 80], C: [108, 90], O: [111, 82] },
    B: { H: [62, 88], S: [60, 56], E: [50, 70], M: [65, 73], G: [86, 80], C: [108, 90], O: [111, 82] },
  },
  'rowing-penche': {
    vue: 'profil',
    A: { ...PENCHE, E: [104, 66], M: [104, 81] },
    B: { ...PENCHE, E: [91, 40], M: [94, 55] },
  },
  'pull-over-couche': {
    vue: 'profil', decor: BANC_PLAT,
    A: { ...COUCHE, E: [51, 77], M: [36, 80] },
    B: { ...COUCHE, E: [69, 57], M: [70, 42] },
  },
  'pull-over-debout': {
    vue: 'profil', ancre: [140, -12],
    A: { ...FENTE_LEGERE, S: [87, 31], E: [100, 20], M: [111, 10] },
    B: { ...FENTE_LEGERE, S: [87, 31], E: [90, 48], M: [92, 63] },
  },
  'souleve-de-terre': {
    vue: 'profil',
    A: { H: [66, 76], S: [95, 62], E: [96, 79], M: [97, 94], G: [89, 84], C: [86, 108], O: [94, 110] },
    B: { H: [84, 61], S: [86, 29], E: [87, 46], M: [88, 61], G: [86, 85], C: [86, 108], O: [94, 110] },
  },
  'souleve-roumain': {
    vue: 'profil',
    A: { H: [84, 61], S: [86, 29], E: [87, 46], M: [88, 61], G: [86, 85], C: [86, 108], O: [94, 110] },
    B: { H: [74, 60], S: [105, 52], E: [105, 69], M: [105, 84], G: [86, 84], C: [86, 108], O: [94, 110] },
  },

  // ─── Lombaires ───
  'good-morning': {
    vue: 'profil',
    A: { H: [84, 61], S: [86, 29], E: [76, 42], M: [86, 27], G: [86, 85], C: [86, 108], O: [94, 110] },
    B: { H: [74, 60], S: [105, 52], E: [99, 66], M: [104, 49], G: [86, 84], C: [86, 108], O: [94, 110] },
  },
  hyperextension: {
    vue: 'profil',
    decor: [{ ligne: [52, 108, 104, 74], epaisseur: 5 }, { cercle: [97, 85, 4] }, { cercle: [62, 108, 3.5] }],
    // Bras croisés sur la poitrine
    A: { C: [60, 104], G: [78, 92], H: [97, 80], O: [56, 98], S: [112, 108], E: [104, 93], M: [91, 100] },
    B: { C: [60, 104], G: [78, 92], H: [97, 80], O: [56, 98], S: [123, 62], E: [109, 72], M: [118, 84] },
  },
  'extension-dos-assis': {
    vue: 'profil', decor: SIEGE,
    A: { ...ASSIS, S: [84, 64], E: [74, 75], M: [84, 84] },
    B: { ...ASSIS, S: [56, 58], E: [59, 73], M: [72, 70] },
  },

  // ─── Épaules ───
  'developpe-epaules': {
    vue: 'profil', decor: SIEGE_DOSSIER,
    A: { ...ASSIS, H: [66, 88], S: [66, 56], E: [72, 72], M: [74, 57] },
    B: { ...ASSIS, H: [66, 88], S: [66, 56], E: [70, 39], M: [72, 24] },
  },
  'developpe-militaire': {
    vue: 'profil',
    A: { ...DEBOUT, E: [86, 46], M: [88, 31] },
    B: { ...DEBOUT, E: [84, 13], M: [86, -2] },
  },
  'elevation-laterale': {
    vue: 'face', ancre: [100, 110],
    A: { ...FACE, E: [64, 47], M: [63, 62] },
    B: { ...FACE, E: [49, 31], M: [34, 32] },
  },
  'oiseau-penche': {
    vue: 'face',
    A: { H: [71, 62], S: [66, 48], G: [70, 86], C: [71, 110], E: [64, 64], M: [63, 79] },
    B: { H: [71, 62], S: [66, 48], G: [70, 86], C: [71, 110], E: [50, 54], M: [35, 57] },
  },
  'elevation-frontale': {
    vue: 'profil',
    A: DEBOUT,
    B: { ...DEBOUT, E: [97, 30], M: [112, 30] },
  },
  'face-pull': {
    vue: 'profil', ancre: [150, 28],
    A: { ...FENTE_LEGERE, S: [80, 30], E: [97, 30], M: [112, 30] },
    B: { ...FENTE_LEGERE, S: [80, 30], E: [70, 20], M: [84, 16] },
  },
  'rowing-menton': {
    vue: 'profil',
    A: DEBOUT,
    B: { ...DEBOUT, E: [73, 15], M: [86, 22] },
  },

  // ─── Trapèzes ───
  shrug: {
    vue: 'face',
    A: { ...FACE, E: [64, 47], M: [63, 62] },
    B: { ...FACE, S: [66, 25], E: [64, 42], M: [63, 57] },
  },

  // ─── Bras ───
  curl: {
    vue: 'profil',
    A: DEBOUT,
    B: { ...DEBOUT, M: [92, 36] },
  },
  'curl-incline': {
    vue: 'profil', decor: [{ ligne: [62, 62, 100, 92], epaisseur: 5 }, { rect: [96, 88, 24, 5] }, { ligne: [106, 93, 106, 110], epaisseur: 3 }],
    A: { H: [100, 86], S: [76, 64], G: [122, 92], C: [120, 110], E: [74, 81], M: [73, 96] },
    B: { H: [100, 86], S: [76, 64], G: [122, 92], C: [120, 110], E: [74, 81], M: [86, 72] },
  },
  'curl-pupitre': {
    vue: 'profil',
    decor: [{ ligne: [82, 60, 100, 78], epaisseur: 6 }, { ligne: [100, 78, 100, 110], epaisseur: 3 }, { rect: [56, 88, 28, 5] }],
    A: { H: [66, 86], S: [70, 54], G: [90, 88], C: [90, 110], O: [98, 110], E: [84, 65], M: [95, 76] },
    B: { H: [66, 86], S: [70, 54], G: [90, 88], C: [90, 110], O: [98, 110], E: [84, 65], M: [80, 51] },
  },
  'curl-poulie-haute': {
    vue: 'face', ancre: [0, 30],
    A: { ...FACE, E: [49, 31], M: [34, 32] },
    B: { ...FACE, E: [49, 31], M: [54, 17] },
  },
  'curl-bras-arriere': {
    vue: 'profil', ancre: [14, 108],
    A: { ...FENTE_LEGERE, S: [80, 30], E: [72, 46], M: [64, 58] },
    B: { ...FENTE_LEGERE, S: [80, 30], E: [72, 46], M: [78, 32] },
  },
  'extension-poulie-haute': {
    vue: 'profil', ancre: [100, -14],
    A: { ...DEBOUT, S: [84, 31], E: [86, 48], M: [98, 39] },
    B: { ...DEBOUT, S: [84, 31], E: [86, 48], M: [88, 63] },
  },
  'extension-tete': {
    vue: 'profil', ancre: [24, 108],
    A: { ...FENTE_LEGERE, S: [80, 30], E: [84, 13], M: [72, 4] },
    B: { ...FENTE_LEGERE, S: [80, 30], E: [84, 13], M: [86, -2] },
  },
  'barre-au-front': {
    vue: 'profil', decor: BANC_PLAT,
    A: { ...COUCHE, E: [64, 57], M: [54, 67] },
    B: { ...COUCHE, E: [64, 57], M: [63, 42] },
  },
  kickback: {
    vue: 'profil',
    A: { ...PENCHE, E: [88, 52], M: [88, 67] },
    B: { ...PENCHE, E: [88, 52], M: [73, 55] },
  },
  'dips-assis': {
    vue: 'profil', decor: SIEGE_DOSSIER,
    A: { ...ASSIS, E: [50, 68], M: [64, 66] },
    B: { ...ASSIS, E: [61, 73], M: [63, 88] },
  },

  // ─── Jambes ───
  squat: {
    vue: 'profil',
    A: { H: [80, 62], S: [80, 30], G: [81, 86], C: [80, 110], O: [89, 110], E: [70, 42], M: [78, 28] },
    B: { H: [62, 88], S: [82, 62], G: [88, 87], C: [80, 110], O: [89, 110], E: [72, 74], M: [80, 60] },
  },
  'squat-goblet': {
    vue: 'profil',
    A: { H: [80, 62], S: [80, 30], G: [81, 86], C: [80, 110], O: [89, 110], E: [84, 46], M: [90, 38] },
    B: { H: [62, 88], S: [82, 62], G: [88, 87], C: [80, 110], O: [89, 110], E: [86, 78], M: [92, 70] },
  },
  'squat-bras-tendus': {
    vue: 'profil',
    A: { H: [80, 62], S: [80, 30], G: [81, 86], C: [80, 110], O: [89, 110], E: [80, 47], M: [80, 62] },
    B: { H: [62, 88], S: [82, 62], G: [88, 87], C: [80, 110], O: [89, 110], E: [83, 79], M: [84, 94] },
  },
  'presse-cuisses': {
    vue: 'profil',
    decor: [{ ligne: [40, 64, 70, 94], epaisseur: 5 }, { ligne: [66, 97, 86, 97], epaisseur: 5 }, { ligne: [80, 102, 140, 52], epaisseur: 2 }],
    A: { H: [72, 92], S: [47, 72], E: [58, 86], M: [71, 95], G: [82, 69], C: [104, 60], O: [107, 52] },
    B: { H: [72, 92], S: [47, 72], E: [58, 86], M: [71, 95], G: [93, 76], C: [112, 61], O: [118, 55] },
  },
  'mollets-presse': {
    vue: 'profil',
    decor: [{ ligne: [40, 64, 70, 94], epaisseur: 5 }, { ligne: [66, 97, 86, 97], epaisseur: 5 }, { ligne: [80, 102, 140, 52], epaisseur: 2 }],
    A: { H: [72, 92], S: [47, 72], E: [58, 86], M: [71, 95], G: [93, 76], C: [112, 61], O: [114, 52] },
    B: { H: [72, 92], S: [47, 72], E: [58, 86], M: [71, 95], G: [93, 76], C: [112, 61], O: [120, 56] },
  },
  'leg-extension': {
    vue: 'profil',
    decor: [{ ligne: [58, 50, 58, 84], epaisseur: 5 }, { rect: [56, 82, 36, 5] }, { ligne: [74, 87, 74, 110], epaisseur: 3 }],
    A: { H: [66, 80], S: [64, 48], E: [70, 64], M: [80, 76], G: [90, 80], C: [92, 104], O: [100, 106] },
    B: { H: [66, 80], S: [64, 48], E: [70, 64], M: [80, 76], G: [90, 80], C: [114, 78], O: [117, 70] },
  },
  'leg-curl-assis': {
    vue: 'profil',
    decor: [{ ligne: [58, 50, 58, 84], epaisseur: 5 }, { rect: [56, 82, 36, 5] }, { ligne: [74, 87, 74, 110], epaisseur: 3 }, { cercle: [88, 74, 4] }],
    A: { H: [66, 80], S: [64, 48], E: [70, 64], M: [80, 76], G: [90, 80], C: [114, 78], O: [117, 70] },
    B: { H: [66, 80], S: [64, 48], E: [70, 64], M: [80, 76], G: [90, 80], C: [84, 103], O: [90, 108] },
  },
  'leg-curl-allonge': {
    vue: 'profil',
    decor: [{ rect: [36, 84, 84, 5] }, { rect: [44, 89, 3, 21] }, { rect: [110, 89, 3, 21] }],
    A: { S: [52, 80], H: [84, 80], E: [50, 97], M: [48, 110], G: [108, 80], C: [132, 80], O: [134, 88] },
    B: { S: [52, 80], H: [84, 80], E: [50, 97], M: [48, 110], G: [108, 80], C: [114, 57], O: [122, 59] },
  },
  fentes: {
    vue: 'profil',
    A: { ...DEBOUT, G2: [79, 86], C2: [78, 110], O2: [86, 110] },
    B: {
      H: [80, 84], S: [80, 52], E: [81, 69], M: [82, 84], G: [104, 86], C: [104, 110], O: [112, 110],
      G2: [68, 106], C2: [46, 104], O2: [44, 110],
    },
  },
  'split-squat': {
    vue: 'profil',
    decor: [{ rect: [26, 88, 26, 5] }, { rect: [30, 93, 3, 17] }, { rect: [46, 93, 3, 17] }],
    A: { ...DEBOUT, G: [84, 86], C: [84, 110], O: [92, 110], G2: [70, 84], C2: [50, 88], O2: [44, 86] },
    B: {
      H: [80, 84], S: [82, 52], E: [83, 69], M: [84, 84], G: [104, 86], C: [104, 110], O: [112, 110],
      G2: [66, 104], C2: [50, 88], O2: [44, 86],
    },
  },
  'hip-thrust': {
    vue: 'profil',
    decor: [{ rect: [30, 70, 30, 6] }, { rect: [34, 76, 3, 34] }, { rect: [54, 76, 3, 34] }],
    A: { S: [54, 68], H: [78, 92], E: [64, 82], M: [78, 88], G: [100, 82], C: [104, 106], O: [112, 108] },
    B: { S: [54, 68], H: [85, 70], E: [69, 74], M: [85, 66], G: [107, 79], C: [106, 103], O: [114, 106] },
  },
  'kickback-quatre-pattes': {
    vue: 'profil',
    A: {
      H: [76, 74], S: [106, 74], E: [106, 91], M: [106, 106], G: [84, 96], C: [64, 104], O: [58, 108],
      G2: [78, 98], C2: [56, 102], O2: [52, 108],
    },
    B: {
      H: [76, 74], S: [106, 74], E: [106, 91], M: [106, 106], G: [54, 68], C: [32, 62], O: [28, 56],
      G2: [78, 98], C2: [56, 102], O2: [52, 108],
    },
  },
  'kickback-debout': {
    vue: 'profil', ancre: [128, 110],
    A: { H: [80, 62], S: [86, 31], E: [96, 44], M: [106, 40], G: [82, 86], C: [78, 109], O: [86, 110], G2: [80, 86], C2: [80, 110], O2: [88, 110] },
    B: { H: [80, 62], S: [86, 31], E: [96, 44], M: [106, 40], G: [64, 80], C: [48, 98], O: [46, 106], G2: [80, 86], C2: [80, 110], O2: [88, 110] },
  },
  'abduction-assis': {
    vue: 'face', decor: [{ rect: [54, 70, 52, 6] }],
    A: { H: [72, 70], S: [67, 40], E: [62, 56], M: [63, 70], G: [77, 86], C: [76, 108] },
    B: { H: [72, 70], S: [67, 40], E: [62, 56], M: [63, 70], G: [58, 84], C: [60, 108] },
  },
  'abduction-debout': {
    vue: 'face', ancre: [30, 110],
    A: { ...FACE, E: [64, 47], M: [63, 62], G2: [88, 86], C2: [88, 110] },
    B: { ...FACE, E: [64, 47], M: [63, 62], G2: [100, 84], C2: [110, 106] },
  },
  'adduction-debout': {
    vue: 'face', ancre: [150, 108],
    A: { ...FACE, E: [64, 47], M: [63, 62], G2: [100, 84], C2: [110, 106] },
    B: { ...FACE, E: [64, 47], M: [63, 62], G2: [86, 86], C2: [82, 110] },
  },
  'mollets-debout': {
    vue: 'profil', decor: [{ rect: [72, 105, 26, 5] }],
    A: { H: [80, 62], S: [80, 30], E: [72, 42], M: [78, 28], G: [80, 86], C: [79, 110], O: [88, 105] },
    B: { H: [81, 56], S: [81, 24], E: [73, 36], M: [79, 22], G: [81, 80], C: [81, 103], O: [89, 105] },
  },
  'mollets-debout-halteres': {
    vue: 'profil', decor: [{ rect: [72, 105, 26, 5] }],
    A: { H: [80, 62], S: [80, 30], E: [81, 47], M: [82, 62], G: [80, 86], C: [79, 110], O: [88, 105] },
    B: { H: [81, 56], S: [81, 24], E: [82, 41], M: [83, 56], G: [81, 80], C: [81, 103], O: [89, 105] },
  },
  'mollets-assis': {
    vue: 'profil', decor: [{ rect: [50, 86, 34, 5] }, { rect: [90, 106, 14, 4] }],
    A: { H: [64, 86], S: [62, 54], E: [70, 70], M: [82, 78], G: [88, 86], C: [87, 110], O: [96, 106] },
    B: { H: [64, 86], S: [62, 54], E: [70, 70], M: [82, 78], G: [88, 81], C: [88, 104], O: [97, 106] },
  },

  // ─── Abdos ───
  'crunch-sol': {
    vue: 'profil',
    // Mains derrière la tête
    A: { H: [84, 104], S: [52, 104], E: [48, 89], M: [40, 101], G: [100, 84], C: [116, 104], O: [124, 106] },
    B: { H: [84, 104], S: [56, 88], E: [58, 73], M: [48, 82], G: [100, 84], C: [116, 104], O: [124, 106] },
  },
  'crunch-machine': {
    vue: 'profil', decor: SIEGE,
    A: { ...ASSIS, S: [62, 56], E: [70, 68], M: [76, 58] },
    B: { ...ASSIS, S: [84, 66], E: [92, 78], M: [98, 68] },
  },
  'crunch-poulie': {
    vue: 'profil', ancre: [100, -14],
    A: { H: [84, 84], G: [84, 108], C: [60, 108], O: [56, 104], S: [96, 55], E: [106, 64], M: [104, 50] },
    B: { H: [84, 84], G: [84, 108], C: [60, 108], O: [56, 104], S: [114, 96], E: [124, 102], M: [126, 92] },
  },
  'rotation-buste': {
    vue: 'face', decor: [{ rect: [54, 70, 52, 6] }],
    A: { H: [72, 70], S: [64, 40], E: [64, 56], M: [80, 50], G: [72, 86], C: [72, 108], S2: [92, 41], E2: [92, 57], M2: [80, 52] },
    B: { H: [72, 70], S: [70, 41], E: [70, 57], M: [86, 52], G: [72, 86], C: [72, 108], S2: [98, 40], E2: [98, 56], M2: [86, 50] },
  },
  'releves-jambes': {
    vue: 'profil', sol: false,
    decor: [{ ligne: [72, 20, 72, 72], epaisseur: 5 }, { ligne: [72, 50, 100, 50], epaisseur: 5 }, { ligne: [100, 50, 100, 118], epaisseur: 3 }],
    A: { S: [78, 32], H: [78, 64], E: [80, 48], M: [95, 46], G: [79, 88], C: [78, 112], O: [86, 113] },
    B: { S: [78, 32], H: [78, 64], E: [80, 48], M: [95, 46], G: [102, 60], C: [104, 84], O: [112, 84] },
  },
  'releves-suspendu': {
    vue: 'profil', sol: false, decor: BARRE_FIXE,
    A: { M: [80, 8], E: [80, 23], S: [80, 40], H: [80, 72], G: [81, 95], C: [78, 116], O: [84, 120] },
    B: { M: [80, 8], E: [80, 23], S: [80, 40], H: [80, 72], G: [104, 68], C: [106, 92], O: [114, 92] },
  },
  gainage: {
    vue: 'profil',
    A: { S: [58, 90], E: [58, 107], M: [73, 108], H: [90, 92], G: [114, 97], C: [138, 103], O: [140, 110] },
    B: { S: [58, 90], E: [58, 107], M: [73, 108], H: [90, 90], G: [114, 96], C: [138, 103], O: [140, 110] },
  },
  'gainage-lateral': {
    vue: 'profil',
    A: { S: [58, 90], E: [58, 107], M: [73, 108], H: [90, 96], G: [114, 100], C: [138, 104], O: [140, 110] },
    B: { S: [58, 90], E: [58, 107], M: [73, 108], H: [90, 88], G: [114, 95], C: [138, 103], O: [140, 110] },
  },
  'roue-abdo': {
    vue: 'profil',
    A: { G: [76, 108], C: [54, 108], O: [50, 104], H: [78, 86], S: [106, 70], E: [107, 87], M: [108, 102] },
    B: { G: [76, 108], C: [54, 108], O: [50, 104], H: [94, 92], S: [124, 96], E: [140, 99], M: [153, 104] },
  },
} satisfies Record<string, Motif>;

export type MotifId = keyof typeof MOTIFS;

export interface Geste {
  motif: MotifId;
  materiel: Materiel;
  /** Joue le motif à l'envers (la phase d'effort va de B vers A). */
  inverse?: boolean;
}

const g = (motif: MotifId, materiel: Materiel = 'aucun', inverse = false): Geste => ({ motif, materiel, inverse });

/** Geste animé de chaque exercice du catalogue. */
export const GESTES: Record<string, Geste> = {
  // Pectoraux
  'presse-pectorale': g('presse-assise', 'machine'),
  'presse-inclinee': g('presse-assise-inclinee', 'machine'),
  'presse-convergente-disques': g('presse-assise', 'machine'),
  'presse-inclinee-disques': g('presse-assise-inclinee', 'machine'),
  butterfly: g('ecarte-assis', 'machine'),
  'developpe-couche-smith': g('developpe-couche', 'smith'),
  'developpe-incline-smith': g('developpe-incline', 'smith'),
  'ecarte-poulie-haute': g('ecarte-poulie-haute', 'poulie'),
  'ecarte-poulie-basse': g('ecarte-poulie-basse', 'poulie'),
  crossover: g('crossover', 'poulie'),
  'developpe-couche-barre': g('developpe-couche', 'barre'),
  'developpe-couche-halteres': g('developpe-couche', 'halteres'),
  'developpe-incline-halteres': g('developpe-incline', 'halteres'),
  'developpe-incline-barre': g('developpe-incline', 'barre'),
  'developpe-decline': g('developpe-couche', 'barre'),
  'ecarte-halteres': g('ecarte-couche', 'halteres'),
  pompes: g('pompes'),
  'dips-buste-penche': g('dips'),
  // Dos
  'tirage-vertical-machine': g('tirage-vertical', 'machine'),
  'tirage-vertical-disques': g('tirage-vertical', 'machine'),
  'tirage-horizontal-machine': g('rowing-assis', 'machine'),
  'rowing-convergent-disques': g('rowing-assis', 'machine'),
  'pull-over-machine': g('pull-over-couche', 'machine'),
  'traction-assistee': g('tractions'),
  'tirage-vertical': g('tirage-vertical', 'poulie'),
  'tirage-vertical-serre': g('tirage-vertical', 'poulie'),
  'tirage-horizontal-poulie': g('rowing-assis', 'poulie'),
  'pull-over-poulie': g('pull-over-debout', 'poulie'),
  'rowing-poulie-un-bras': g('rowing-assis', 'poulie'),
  tractions: g('tractions'),
  'rowing-barre': g('rowing-penche', 'barre'),
  'rowing-haltere': g('rowing-penche', 'halteres'),
  't-bar-row': g('rowing-penche', 'barre'),
  'souleve-de-terre': g('souleve-de-terre', 'barre'),
  'pull-over-haltere': g('pull-over-couche', 'halteres'),
  // Lombaires
  'banc-lombaires': g('hyperextension'),
  'extension-dos-machine': g('extension-dos-assis'),
  hyperextensions: g('hyperextension'),
  'good-morning': g('good-morning', 'epaule'),
  // Épaules
  'presse-epaules': g('developpe-epaules', 'machine'),
  'developpe-epaules-smith': g('developpe-epaules', 'smith'),
  'elevations-laterales-machine': g('elevation-laterale', 'machine'),
  'oiseau-pec-deck': g('ecarte-assis', 'machine', true),
  'elevation-laterale-poulie': g('elevation-laterale', 'poulie'),
  'elevation-frontale-poulie': g('elevation-frontale', 'machine'),
  'face-pull': g('face-pull', 'poulie'),
  'oiseau-poulie': g('oiseau-penche', 'machine'),
  'developpe-militaire': g('developpe-militaire', 'barre'),
  'developpe-halteres-epaules': g('developpe-epaules', 'halteres'),
  'elevations-laterales': g('elevation-laterale', 'halteres'),
  'oiseau-halteres': g('oiseau-penche', 'halteres'),
  'elevations-frontales': g('elevation-frontale', 'halteres'),
  'rowing-menton': g('rowing-menton', 'barre'),
  // Trapèzes
  'shrug-smith': g('shrug', 'barre'),
  'shrug-poulie': g('shrug', 'barre'),
  'shrug-barre': g('shrug', 'barre'),
  'shrug-halteres': g('shrug', 'halteres'),
  // Biceps
  'curl-pupitre-machine': g('curl-pupitre', 'machine'),
  'curl-barre-poulie': g('curl', 'machine'),
  'curl-corde-marteau': g('curl', 'machine'),
  'curl-poulie-haute': g('curl-poulie-haute', 'poulie'),
  'curl-bayesian': g('curl-bras-arriere', 'poulie'),
  'curl-barre': g('curl', 'barre'),
  'curl-halteres': g('curl', 'halteres'),
  'curl-marteau': g('curl', 'halteres'),
  'curl-incline': g('curl-incline', 'halteres'),
  'curl-pupitre': g('curl-pupitre', 'barre'),
  'curl-concentre': g('curl', 'halteres'),
  // Triceps
  'extension-triceps-machine': g('curl-pupitre', 'machine', true),
  'dips-machine': g('dips-assis', 'machine'),
  'extension-poulie-haute': g('extension-poulie-haute', 'poulie'),
  'extension-corde-tete': g('extension-tete', 'poulie'),
  'barre-au-front': g('barre-au-front', 'barre'),
  dips: g('dips'),
  'developpe-serre': g('developpe-couche', 'barre'),
  kickback: g('kickback', 'halteres'),
  'extension-haltere-tete': g('extension-tete', 'halteres'),
  // Quadriceps
  'presse-cuisses': g('presse-cuisses', 'plateau'),
  'presse-horizontale': g('presse-cuisses', 'plateau'),
  'leg-extension': g('leg-extension', 'rouleau'),
  'hack-squat': g('squat', 'epaule'),
  'squat-smith': g('squat', 'smith'),
  'squat-barre': g('squat', 'epaule'),
  'goblet-squat': g('squat-goblet', 'halteres'),
  fentes: g('fentes', 'halteres'),
  'split-squat-bulgare': g('split-squat', 'halteres'),
  // Ischios
  'leg-curl-assis': g('leg-curl-assis', 'rouleau'),
  'leg-curl-allonge': g('leg-curl-allonge', 'rouleau'),
  'souleve-roumain': g('souleve-roumain', 'barre'),
  'souleve-jambes-tendues': g('souleve-roumain', 'barre'),
  // Fessiers
  'hip-thrust-machine': g('hip-thrust', 'hanches'),
  'abducteurs-machine': g('abduction-assis', 'genoux'),
  'kickback-fessier-machine': g('kickback-quatre-pattes', 'rouleau'),
  'kickback-poulie': g('kickback-debout', 'poulie-cheville'),
  'abduction-poulie': g('abduction-debout', 'poulie-cheville'),
  'hip-thrust-barre': g('hip-thrust', 'hanches'),
  'fentes-arriere': g('fentes', 'halteres'),
  // Adducteurs
  'adducteurs-machine': g('abduction-assis', 'genoux', true),
  'adduction-poulie': g('adduction-debout', 'poulie-cheville'),
  'squat-sumo': g('squat-bras-tendus', 'halteres'),
  // Mollets
  'mollets-debout': g('mollets-debout', 'epaule'),
  'mollets-assis': g('mollets-assis', 'genoux'),
  'mollets-presse': g('mollets-presse', 'plateau'),
  'mollets-halteres': g('mollets-debout-halteres', 'halteres'),
  // Abdos
  'crunch-machine': g('crunch-machine', 'machine'),
  'rotation-buste-machine': g('rotation-buste', 'machine'),
  'crunch-poulie': g('crunch-poulie', 'poulie'),
  woodchop: g('ecarte-poulie-haute', 'poulie'),
  'releves-jambes': g('releves-jambes'),
  'releves-jambes-suspendu': g('releves-suspendu'),
  'crunch-sol': g('crunch-sol'),
  gainage: g('gainage'),
  'gainage-lateral': g('gainage-lateral'),
  'roue-abdo': g('roue-abdo', 'roue'),
};
