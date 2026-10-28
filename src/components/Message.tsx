import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Ton = 'info' | 'erreur';
interface MessageAffiche {
  texte: string;
  ton: Ton;
  cle: number;
}

const Contexte = createContext<(texte: string, ton?: Ton) => void>(() => {});

/** Affiche un court message en bas de l'écran ("Sauvegarde exportée", etc.). */
export function useMessage() {
  return useContext(Contexte);
}

export function FournisseurMessage({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<MessageAffiche | null>(null);
  const minuteur = useRef<number | undefined>(undefined);

  const afficher = useCallback((texte: string, ton: Ton = 'info') => {
    window.clearTimeout(minuteur.current);
    setMessage({ texte, ton, cle: Date.now() });
    minuteur.current = window.setTimeout(() => setMessage(null), 3200);
  }, []);

  return (
    <Contexte.Provider value={afficher}>
      {children}
      {message && (
        <div
          key={message.cle}
          className={`message message-${message.ton}`}
          role={message.ton === 'erreur' ? 'alert' : 'status'}
        >
          {message.texte}
        </div>
      )}
    </Contexte.Provider>
  );
}
