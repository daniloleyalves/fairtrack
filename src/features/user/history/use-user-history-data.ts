'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getUserContributions } from '@/server/user/queries';
import { userKeys } from '@/server/user/query-keys';

const INITIAL_OPTIONS = { limit: 100 } as const;
const ALL_OPTIONS = { limit: 100000 } as const;

export function useUserHistoryData() {
  const [loadingMode, setLoadingMode] = useState<'initial' | 'all'>('initial');
  const queryClient = useQueryClient();

  const initialQuery = useQuery({
    ...userKeys.contributions(INITIAL_OPTIONS),
    queryFn: () => getUserContributions(INITIAL_OPTIONS),
  });

  const allQuery = useQuery({
    ...userKeys.contributions(ALL_OPTIONS),
    queryFn: () => getUserContributions(ALL_OPTIONS),
    enabled: loadingMode === 'all',
  });

  const current =
    loadingMode === 'all' && allQuery.data ? allQuery.data : initialQuery.data;

  const totalCount = current?.total ?? 0;
  const loadedCount = current?.data?.length ?? 0;

  return {
    isPending: initialQuery.isPending,
    error: initialQuery.error,
    contributions: current?.data ?? [],
    totalCount,
    loadedCount,
    isLoadingAll: loadingMode === 'all' && allQuery.isPending,
    hasLoadedAll:
      (loadingMode === 'all' && !allQuery.isPending && !!allQuery.data) ||
      (!initialQuery.isPending && loadedCount === totalCount),
    isEmpty: current?.data?.length === 0,

    loadAll: () => setLoadingMode('all'),
    refresh: () => {
      void queryClient.invalidateQueries({
        queryKey: userKeys.contributions(INITIAL_OPTIONS).queryKey,
      });
      if (loadingMode === 'all') {
        void queryClient.invalidateQueries({
          queryKey: userKeys.contributions(ALL_OPTIONS).queryKey,
        });
      }
    },
  };
}
