import type { ReactNode } from 'react';
import { BoutonRetour } from '../components/BoutonRetour';
import { Entete } from '../components/Entete';
import { NOM_RACCOURCI, lancerRaccourci } from '../lib/raccourci';

/**
 * Page d'aide illustrée : créer le raccourci iOS "Repos FitPark" qui lance le minuteur
 * de l'app Horloge (affiché dans la Dynamic Island, même app fermée).
 */
export function AideRaccourci() {
  return (
    <>
      <BoutonRetour libelle="Réglages" repli="/reglages" />
      <Entete surtitre="Minuteur iPhone" titre="Créer le raccourci" />

      <div className="carte aide-intro">
        <p>
          Une web app ne peut pas afficher son propre chrono dans la Dynamic Island. Le contournement :
          à chaque série validée, FitPark ouvre un raccourci qui lance le <strong>minuteur de l’app
          Horloge</strong>. Lui s’affiche dans la Dynamic Island et sonne même si FitPark est fermée.
        </p>
        <p>À faire une seule fois, en 2 minutes.</p>
      </div>

      <ol className="etapes-aide">
        <Etape n={1} titre="Ouvre l’app Raccourcis">
          <p>Elle est installée d’origine sur l’iPhone. Touche <strong>+</strong> en haut à droite.</p>
        </Etape>

        <Etape n={2} titre={`Nomme-le « ${NOM_RACCOURCI} »`}>
          <p>Touche le nom en haut, puis <strong>Renommer</strong>. Le nom doit être exactement :</p>
          <p className="aide-nom">{NOM_RACCOURCI}</p>
          <p className="note-petite">Majuscules et espace compris.</p>
        </Etape>

        <Etape n={3} titre="Ajoute « Obtenir les nombres de l’entrée »">
          <p>
            Touche <strong>Ajouter une action</strong>, cherche <strong>nombres</strong> et choisis l’action
            qui obtient des nombres depuis l’entrée. Vérifie qu’elle utilise <strong>Entrée du raccourci</strong>.
          </p>
          <Maquette>
            <Bloc couleur="gris" texte={<>Obtenir les nombres de <Jeton>Entrée du raccourci</Jeton></>} />
          </Maquette>
        </Etape>

        <Etape n={4} titre="Ajoute « Démarrer le minuteur »">
          <p>
            Cherche <strong>minuteur</strong> (action de l’app Horloge). Touche la durée, choisis la variable{' '}
            <strong>Nombres</strong> de l’étape 3, puis l’unité <strong>secondes</strong>.
          </p>
          <Maquette>
            <Bloc couleur="gris" texte={<>Obtenir les nombres de <Jeton>Entrée du raccourci</Jeton></>} />
            <span className="maquette-fleche" aria-hidden="true" />
            <Bloc couleur="orange" texte={<>Démarrer le minuteur pendant <Jeton>Nombres</Jeton> secondes</>} />
          </Maquette>
        </Etape>

        <Etape n={5} titre="Si le raccourci demande une entrée">
          <p>
            Si au test le minuteur ne démarre pas, touche <strong>ⓘ</strong> (détails du raccourci) et active la
            réception d’entrée (type <strong>Texte</strong>). Désactive aussi « Afficher lors de l’exécution » si
            l’option existe, pour que ce soit plus rapide.
          </p>
        </Etape>

        <Etape n={6} titre="Active l’option dans FitPark">
          <p>
            Réglages → <strong>Minuteur iPhone (Dynamic Island)</strong>. La première fois, iOS demandera
            l’autorisation d’ouvrir Raccourcis : accepte.
          </p>
        </Etape>

        <Etape n={7} titre="Revenir dans FitPark">
          <p>
            Après le lancement, l’iPhone reste dans Raccourcis. Deux façons de revenir, à tester :
          </p>
          <ul className="aide-liste">
            <li>
              <strong>Le petit retour en haut à gauche</strong> de l’écran (« ◀ FitPark »). Option « Retour
              automatique » désactivée.
            </li>
            <li>
              <strong>Retour automatique</strong> (option dans Réglages) : le raccourci rouvre FitPark tout seul.
              Attention, iOS risque d’ouvrir la page dans Safari au lieu de l’app installée : si c’est le cas,
              désactive cette option.
            </li>
          </ul>
        </Etape>
      </ol>

      <section className="section">
        <h2>Tester</h2>
        <div className="carte ligne">
          <div className="libelle">
            Lancer le raccourci avec 10 secondes
            <small>Le minuteur doit apparaître dans la Dynamic Island.</small>
          </div>
          <button type="button" className="bouton principal" onClick={() => lancerRaccourci(10, false)}>
            Tester
          </button>
        </div>
      </section>
    </>
  );
}

function Etape({ n, titre, children }: { n: number; titre: string; children: ReactNode }) {
  return (
    <li className="carte etape-aide">
      <span className="etape-numero chiffres">{n}</span>
      <div>
        <h3>{titre}</h3>
        {children}
      </div>
    </li>
  );
}

/** Petite illustration des actions du raccourci, dessinée pour l'app. */
function Maquette({ children }: { children: ReactNode }) {
  return (
    <div className="maquette" aria-hidden="true">
      {children}
    </div>
  );
}

function Bloc({ couleur, texte }: { couleur: 'gris' | 'orange'; texte: ReactNode }) {
  return (
    <div className={`maquette-bloc ${couleur}`}>
      <span className="maquette-icone" />
      <span>{texte}</span>
    </div>
  );
}

function Jeton({ children }: { children: ReactNode }) {
  return <span className="maquette-jeton">{children}</span>;
}
