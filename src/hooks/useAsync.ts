/**
 * useAsync Hook
 * Hook لمعالجة العمليات غير المتزامنة (Async Operations)
 */

import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

type AsyncFunction<T> = () => Promise<T>;

export function useAsync<T>(
  asyncFunction: AsyncFunction<T>,
  immediate = true
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = async () => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response, error: null });
    } catch (error) {
      setState({
        status: 'error',
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return {
    ...state,
    refetch: execute,
  };
}
