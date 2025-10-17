'use client';

import useSWR from 'swr';
import {
  getClientEnvVariables,
  type ClientEnvVariables,
} from '@/lib/services/client-env';

export function useClientEnv() {
  const result = useSWR<ClientEnvVariables>(
    'client-env-variables',
    getClientEnvVariables,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    },
  );

  return {
    env: result.data,
    isLoading: result.isLoading,
    error: result.error as Error | undefined,
  };
}
