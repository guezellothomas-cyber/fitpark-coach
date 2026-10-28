# FitPark Coach

Carnet de musculation personnel, en web app installable sur iPhone (PWA).
Fonctionne hors connexion. Toutes les données restent sur le téléphone, sans compte ni serveur.

Adresse : https://guezellothomas-cyber.github.io/fitpark-coach/

## Ce que fait l'app

- **Aujourd'hui** : la séance du jour, un gros bouton pour la lancer, la semaine en un coup d'œil.
- **Séances** : création de séances (jours, muscles, exercices, supersets, glisser-déposer),
  suggestions du guide, ordre conseillé, et **générateur de programme** de 2 à 6 jours.
- **Exercices** : 114 exercices classés par type de matériel, recherche, filtres, réglage
  « dans ma salle », fiche avec geste animé, silhouette des muscles travaillés et historique.
- **Mode séance** : saisie charge / reps par boutons + et −, dernière performance, surcharge
  progressive, échauffement calculé, remplacement d'exercice, chrono de repos (basé sur l'heure
  de fin), option minuteur iPhone via un raccourci (Dynamic Island), résumé et records.
- **Progrès** : carte du corps de la semaine, équilibre poussée / tirage, records et 1RM estimé,
  courbes par exercice, poids de corps et mensurations.
- **Réglages** : thème sombre / clair / auto, pas de charge, repos, son, minuteur iPhone,
  sauvegarde et restauration en fichier JSON.

## Commandes utiles

| Commande | Ce qu'elle fait |
| --- | --- |
| `npm install` | Installe les bibliothèques (une seule fois) |
| `npm run dev` | Lance l'app en local pour développer |
| `npm test` | Lance les tests automatiques |
| `npm run build` | Construit la version finale dans `dist/` |
| `npm run preview` | Affiche la version finale en local |
| `npm run icones` | Régénère les icônes à partir de `public/icon.svg` |

## Mise en ligne

Chaque envoi (`git push`) sur la branche `main` lance les tests puis publie automatiquement
sur GitHub Pages (voir `.github/workflows/deploy.yml`).

## Installer sur l'iPhone

1. Ouvrir l'adresse dans **Safari**.
2. Bouton Partager → **Sur l'écran d'accueil** → Ajouter.
3. Ouvrir l'app depuis l'icône. Elle marche ensuite sans connexion.
4. Exporter régulièrement une sauvegarde (Réglages → Mes données).

## Organisation du code

- `src/data/` : catalogue des exercices, muscles et zones, silhouette, gestes animés
- `src/db/` : base locale (Dexie / IndexedDB) : réglages, salle, séances, entraînements, mesures, sauvegarde
- `src/lib/` : logique testée : guide de suggestions, ordre conseillé, déroulement de séance,
  progression, records, statistiques, générateur de programme, animation
- `src/components/` : briques d'interface (réglettes + / −, silhouette, animation, courbe…)
- `src/screens/` : les écrans
- `src/styles/` : thèmes clair / sombre et styles

## Limites connues (web app sur iPhone)

- Pas de Live Activity dans la Dynamic Island : contournement par le raccourci « Repos FitPark »
  qui lance le minuteur de l'app Horloge.
- Le son de fin de repos ne joue que si l'app est à l'écran, et le bouton silencieux le coupe.
- Les données sont dans Safari : exporter une sauvegarde de temps en temps.
