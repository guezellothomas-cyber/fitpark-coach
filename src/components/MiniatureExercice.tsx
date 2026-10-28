import { memo } from 'react';
import { exerciceParId } from '../data/exercices';
import { meilleurCadrage, meilleureVue, regionsExercice } from '../data/regions';
import { SilhouetteMuscles } from './SilhouetteMuscles';

/**
 * Petite silhouette pour les listes d'exercices : la vue (face ou dos) et la moitié du corps
 * (haut ou bas) qui montrent le mieux le muscle travaillé.
 */
export const MiniatureExercice = memo(function MiniatureExercice({ exerciceId }: { exerciceId: string }) {
  const e = exerciceParId(exerciceId);
  if (!e) return null;
  const carte = regionsExercice(e);
  const cadrage = meilleurCadrage(carte);
  return (
    <SilhouetteMuscles
      carte={carte}
      vues={meilleureVue(carte)}
      cadrage={cadrage}
      className={`miniature ${cadrage}`}
      titre=""
    />
  );
});
