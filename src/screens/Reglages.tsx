import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Entete } from '../components/Entete';
import { Feuille } from '../components/Feuille';
import { Link } from 'react-router-dom';
import { IconeChevron, IconeExporter, IconeImporter } from '../components/Icones';
import { Interrupteur } from '../components/Interrupteur';
import { useMessage } from '../components/Message';
import { Reglette } from '../components/Reglette';
import { Segments } from '../components/Segments';
import { demanderStockagePersistant } from '../db/db';
import { majReglages, useReglages } from '../db/reglages';
import {
  exporterSauvegarde,
  lireSauvegarde,
  restaurerSauvegarde,
  resumerSauvegarde,
  type Sauvegarde,
} from '../db/sauvegarde';
import type { Theme } from '../db/types';
import { formatDuree } from '../lib/format';
import { VERSION } from '../version';

const THEMES = [
  { valeur: 'sombre', libelle: 'Sombre' },
  { valeur: 'clair', libelle: 'Clair' },
  { valeur: 'auto', libelle: 'Auto' },
] as const satisfies readonly { valeur: Theme; libelle: string }[];

/** Vrai si l'app est lancée depuis l'icône de l'écran d'accueil (et non dans Safari). */
function estInstallee(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

export function Reglages() {
  const reglages = useReglages();
  const afficherMessage = useMessage();
  const champFichier = useRef<HTMLInputElement>(null);
  const [aRestaurer, setARestaurer] = useState<Sauvegarde | null>(null);
  const [persistant, setPersistant] = useState<boolean | null>(null);

  useEffect(() => {
    void demanderStockagePersistant().then(setPersistant);
  }, []);

  async function exporter() {
    try {
      if (await exporterSauvegarde()) afficherMessage('Sauvegarde exportée');
    } catch {
      afficherMessage("L'export a échoué", 'erreur');
    }
  }

  async function fichierChoisi(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = ''; // permet de rechoisir le même fichier ensuite
    if (!fichier) return;
    try {
      setARestaurer(await lireSauvegarde(fichier));
    } catch (err) {
      afficherMessage(err instanceof Error ? err.message : 'Fichier illisible', 'erreur');
    }
  }

  async function restaurer() {
    if (!aRestaurer) return;
    try {
      await restaurerSauvegarde(aRestaurer);
      afficherMessage('Données restaurées');
    } catch {
      afficherMessage('La restauration a échoué, rien n’a été modifié', 'erreur');
    }
    setARestaurer(null);
  }

  return (
    <>
      <Entete surtitre="FitPark Coach" titre="Réglages" />

      <section className="section">
        <h2>Apparence</h2>
        <div className="carte ligne">
          <div className="libelle">
            <Segments
              libelle="Thème"
              options={THEMES}
              valeur={reglages.theme}
              onChange={(theme) => void majReglages({ theme })}
            />
          </div>
        </div>
        <p className="note">« Auto » suit le mode clair / sombre de l'iPhone.</p>
      </section>

      <section className="section">
        <h2>En séance</h2>
        <div className="carte">
          <div className="ligne empilee">
            <div className="libelle">
              Pas de charge
              <small>Écart entre deux charges avec les boutons + et −</small>
            </div>
            <Reglette
              libelle="pas de charge"
              valeur={reglages.pasCharge}
              pas={0.5}
              min={0.5}
              max={10}
              unite="kg"
              onChange={(pasCharge) => void majReglages({ pasCharge })}
            />
          </div>
          <div className="ligne empilee">
            <div className="libelle">
              Repos par défaut
              <small>Proposé pour chaque nouvel exercice</small>
            </div>
            <Reglette
              libelle="repos par défaut"
              valeur={reglages.reposParDefaut}
              pas={15}
              min={15}
              max={600}
              formater={formatDuree}
              onChange={(reposParDefaut) => void majReglages({ reposParDefaut })}
            />
          </div>
          <div className="ligne">
            <div className="libelle">
              Son en fin de repos
              <small>Quand l'app est ouverte à l'écran</small>
            </div>
            <Interrupteur
              libelle="Son en fin de repos"
              actif={reglages.son}
              onChange={(son) => void majReglages({ son })}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Minuteur iPhone</h2>
        <div className="carte">
          <div className="ligne">
            <div className="libelle">
              Minuteur iPhone (Dynamic Island)
              <small>Chaque série validée lance le raccourci « Repos FitPark »</small>
            </div>
            <Interrupteur
              libelle="Minuteur iPhone (Dynamic Island)"
              actif={reglages.minuteurIphone}
              onChange={(minuteurIphone) => void majReglages({ minuteurIphone })}
            />
          </div>
          {reglages.minuteurIphone && (
            <div className="ligne">
              <div className="libelle">
                Retour automatique
                <small>Le raccourci rouvre FitPark (peut ouvrir Safari à la place)</small>
              </div>
              <Interrupteur
                libelle="Retour automatique"
                actif={reglages.retourAuto}
                onChange={(retourAuto) => void majReglages({ retourAuto })}
              />
            </div>
          )}
          <Link to="/aide/raccourci" className="ligne ligne-lien">
            <div className="libelle">
              Créer le raccourci « Repos FitPark »
              <small>Guide pas à pas, à faire une seule fois</small>
            </div>
            <IconeChevron taille={20} />
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Mes données</h2>
        <div className="carte">
          <div className="ligne empilee">
            <div className="libelle">
              Sauvegarde
              <small>
                Exporter crée un fichier à garder dans Fichiers ou iCloud Drive. Importer remplace
                toutes les données actuelles par celles du fichier.
              </small>
            </div>
            <div className="deux-boutons">
              <button type="button" className="bouton" onClick={() => void exporter()}>
                <IconeExporter taille={22} />
                Exporter
              </button>
              <button
                type="button"
                className="bouton"
                onClick={() => champFichier.current?.click()}
              >
                <IconeImporter taille={22} />
                Importer
              </button>
            </div>
            <input
              ref={champFichier}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => void fichierChoisi(e)}
            />
          </div>
        </div>
        <p className="note">
          Tes données restent sur ce téléphone, sans compte ni serveur.
          {persistant === true && ' Stockage protégé contre l’effacement automatique.'}
          {persistant === false &&
            ' Pense à ajouter l’app à l’écran d’accueil et à exporter régulièrement.'}
        </p>
      </section>

      <section className="section">
        <h2>À propos</h2>
        <div className="carte">
          <div className="ligne">
            <div className="libelle">Version</div>
            <span className="chiffres">{VERSION}</span>
          </div>
          <div className="ligne">
            <div className="libelle">Ouverte depuis l'écran d'accueil</div>
            <span>{estInstallee() ? 'Oui' : 'Non'}</span>
          </div>
        </div>
      </section>

      <Feuille
        ouverte={aRestaurer !== null}
        onFermer={() => setARestaurer(null)}
        titre="Remplacer mes données ?"
      >
        <p>
          {aRestaurer && resumerSauvegarde(aRestaurer)} Toutes les données actuelles seront
          remplacées.
        </p>
        <div className="actions">
          <button type="button" className="bouton principal large" onClick={() => void restaurer()}>
            Restaurer
          </button>
          <button type="button" className="bouton large" onClick={() => setARestaurer(null)}>
            Annuler
          </button>
        </div>
      </Feuille>
    </>
  );
}
