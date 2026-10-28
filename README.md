# FitPark Coach

Carnet de musculation personnel, en web app installable sur iPhone (PWA).
Fonctionne hors connexion. Toutes les données restent sur le téléphone.

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

Chaque envoi (`git push`) sur la branche `main` déclenche la publication automatique
sur GitHub Pages (voir `.github/workflows/deploy.yml`).
L'adresse est `https://<utilisateur>.github.io/fitpark-coach/`.

## Installer sur l'iPhone

1. Ouvrir l'adresse dans **Safari**.
2. Bouton Partager → **Sur l'écran d'accueil** → Ajouter.
3. Ouvrir l'app depuis l'icône. Elle marche ensuite sans connexion.

## Organisation du code

- `src/db/` : base de données locale (Dexie / IndexedDB), réglages, sauvegarde JSON
- `src/components/` : briques d'interface réutilisables (barre d'onglets, boutons + / −…)
- `src/screens/` : les cinq écrans principaux
- `src/styles/` : thèmes clair / sombre et styles
- `src/lib/` : fonctions utilitaires (formats, thème)
