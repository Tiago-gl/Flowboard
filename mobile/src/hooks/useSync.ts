import { useEffect } from "react";

export const useSync = (onSync: () => Promise<void>, interval = 30000) => {
  useEffect(() => {
    // Sincronizar uma vez ao montar
    void onSync();

    // Configurar sincronização periódica
    const timer = setInterval(() => {
      void onSync();
    }, interval);

    return () => clearInterval(timer);
  }, [onSync, interval]);
};
