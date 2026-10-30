/**
 * Muscles et zones musculaires utilisés par le catalogue d'exercices.
 * La "zone" précise quelle partie du muscle un exercice vise en priorité ;
 * le guide de suggestions s'en sert pour proposer une zone pas encore travaillée.
 */

export const MUSCLES = [
  { id: 'pectoraux', libelle: 'Pectoraux' },
  { id: 'dos', libelle: 'Dos' },
  { id: 'lombaires', libelle: 'Lombaires' },
  { id: 'epaules', libelle: 'Épaules' },
  { id: 'trapezes', libelle: 'Trapèzes' },
  { id: 'biceps', libelle: 'Biceps' },
  { id: 'triceps', libelle: 'Triceps' },
  { id: 'avant-bras', libelle: 'Avant-bras' },
  { id: 'quadriceps', libelle: 'Quadriceps' },
  { id: 'ischios', libelle: 'Ischios' },
  { id: 'fessiers', libelle: 'Fessiers' },
  { id: 'adducteurs', libelle: 'Adducteurs' },
  { id: 'mollets', libelle: 'Mollets' },
  { id: 'abdos', libelle: 'Abdos' },
] as const;

export type MuscleId = (typeof MUSCLES)[number]['id'];

/** Zones possibles pour chaque muscle, avec leur libellé affiché. */
export const ZONES = {
  pectoraux: { haut: 'Haut des pecs', milieu: 'Milieu des pecs', bas: 'Bas des pecs' },
  dos: { largeur: 'Largeur (grand dorsal)', epaisseur: 'Épaisseur (milieu du dos)' },
  lombaires: { lombaires: 'Bas du dos' },
  epaules: { avant: 'Épaule avant', cote: 'Épaule côté', arriere: 'Épaule arrière' },
  trapezes: { superieurs: 'Trapèzes supérieurs' },
  biceps: {
    global: 'Biceps complet',
    'longue-portion': 'Longue portion (bras en arrière)',
    'courte-portion': 'Courte portion (bras devant)',
    brachial: 'Brachial (prise marteau)',
  },
  triceps: {
    'longue-portion': 'Longue portion (bras au-dessus de la tête)',
    'autres-chefs': 'Chefs latéral et médial (bras le long du corps)',
  },
  'avant-bras': {
    flechisseurs: 'Fléchisseurs (paume vers le haut)',
    extenseurs: 'Extenseurs (dos de la main)',
    'brachio-radial': 'Brachio-radial (dessus de l’avant-bras)',
  },
  quadriceps: { vastes: 'Vastes (squats, presses)', 'droit-femoral': 'Droit fémoral (extension)' },
  ischios: { hanche: 'Ischios côté hanche (charnière)', genou: 'Ischios côté genou (flexion)' },
  fessiers: { 'grand-fessier': 'Grand fessier', 'moyen-fessier': 'Moyen fessier (côté)' },
  adducteurs: { adducteurs: 'Intérieur des cuisses' },
  mollets: { gastrocnemiens: 'Jumeaux (jambe tendue)', soleaire: 'Soléaire (genou plié)' },
  abdos: { 'grand-droit': 'Grand droit', obliques: 'Obliques', gainage: 'Sangle profonde (gainage)' },
} as const satisfies Record<MuscleId, Record<string, string>>;

/** Zone valide pour un muscle donné (ex. ZoneDe<'pectoraux'> = 'haut' | 'milieu' | 'bas'). */
export type ZoneDe<M extends MuscleId> = keyof (typeof ZONES)[M] & string;

export function libelleMuscle(id: MuscleId): string {
  return MUSCLES.find((m) => m.id === id)?.libelle ?? id;
}

export function libelleZone(muscle: MuscleId, zone: string): string {
  const zones: Record<string, string> = ZONES[muscle];
  return zones[zone] ?? zone;
}
