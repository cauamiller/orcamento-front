import { useState, useCallback } from 'react';

type ApiFunction<T> = (...args: any[]) => Promise<T>;

export function useApi<T = any>(apiFn: ApiFunction<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFn(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { loading, error, data, execute };
}
