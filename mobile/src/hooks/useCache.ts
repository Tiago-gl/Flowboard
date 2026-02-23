import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCache = <T,>(key: string, fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      // Tentar restaurar do cache em caso de erro
      try {
        const cached = await AsyncStorage.getItem(`cache:${key}`);
        if (cached) {
          setData(JSON.parse(cached));
        }
      } catch {
        // Ignorar erro de cache
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};
