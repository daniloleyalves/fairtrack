'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getClientEnvVariables,
  type ClientEnvVariables,
} from '@/lib/services/client-env';

export function useClientEnv() {
  const result = useQuery<ClientEnvVariables>({
    queryKey: ['client-env'],
    queryFn: getClientEnvVariables,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    env: result.data,
    isLoading: result.isPending,
    error: result.error ?? undefined,
  };
}
