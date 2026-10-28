import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Le "service worker" garde une copie de l'app sur le téléphone pour qu'elle marche
 * hors connexion. Quand une nouvelle version est publiée, ce bandeau le signale ;
 * la mise à jour n'est appliquée que si on appuie sur le bouton (jamais en pleine séance).
 */
export function BandeauMiseAJour() {
  const {
    needRefresh: [miseAJourDispo, setMiseAJourDispo],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, enregistrement) {
      if (!enregistrement) return;
      // Cherche une nouvelle version quand l'app revient au premier plan
      // (sur iPhone, une app installée reste souvent ouverte en arrière-plan),
      // et toutes les heures si elle reste affichée.
      const verifier = () => {
        if (navigator.onLine) void enregistrement.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') verifier();
      });
      setInterval(verifier, 60 * 60 * 1000);
    },
  });

  if (!miseAJourDispo) return null;
  return (
    <div className="bandeau-maj" role="status">
      <span>Nouvelle version disponible</span>
      <button type="button" className="bouton" onClick={() => setMiseAJourDispo(false)}>
        Plus tard
      </button>
      <button
        type="button"
        className="bouton principal"
        onClick={() => {
          void updateServiceWorker(true);
          // Filet de sécurité : si la page n'était pas encore pilotée par le service worker
          // (tout premier lancement), le rechargement automatique ne se fait pas ; on le force.
          setTimeout(() => window.location.reload(), 1500);
        }}
      >
        Mettre à jour
      </button>
    </div>
  );
}
