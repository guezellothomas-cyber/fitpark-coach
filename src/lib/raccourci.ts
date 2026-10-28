/**
 * Lancement du raccourci iOS "Repos FitPark", qui démarre le minuteur de l'app Horloge.
 * Ce minuteur s'affiche dans la Dynamic Island et sonne même si FitPark est fermée :
 * c'est le contournement à l'impossibilité, pour une web app, d'afficher une Live Activity.
 */

export const NOM_RACCOURCI = 'Repos FitPark';

/**
 * Adresse qui lance le raccourci avec le nombre de secondes en entrée.
 * Avec `retour`, iOS revient à cette adresse une fois le raccourci terminé (x-success).
 */
export function urlRaccourci(secondes: number, retour?: string): string {
  const nom = encodeURIComponent(NOM_RACCOURCI);
  const texte = encodeURIComponent(String(Math.round(secondes)));
  if (!retour) return `shortcuts://run-shortcut?name=${nom}&input=text&text=${texte}`;
  return `shortcuts://x-callback-url/run-shortcut?name=${nom}&input=text&text=${texte}&x-success=${encodeURIComponent(retour)}`;
}

/** Ouvre l'app Raccourcis. iOS peut demander une confirmation la première fois. */
export function lancerRaccourci(secondes: number, retourAuto: boolean): void {
  window.location.href = urlRaccourci(secondes, retourAuto ? window.location.href : undefined);
}
