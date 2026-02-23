import { useState, useCallback } from "react";
import { ApiError } from "../lib/api";

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof ApiError) {
      setError(err.message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Ocorreu um erro inesperado.");
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, setError, handleError, clearError };
};
