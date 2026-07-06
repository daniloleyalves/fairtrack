'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getContributions } from '@/server/contribution/queries';
import { contributionKeys } from '@/server/contribution/query-keys';

const INITIAL_OPTIONS = { limit: 100 } as const;
const ALL_OPTIONS = { limit: 100000 } as const;

export function useHistoryData() {
  const [loadingMode, setLoadingMode] = useState<'initial' | 'all'>('initial');
  const queryClient = useQueryClient();

  const initialQuery = useQuery({
    ...contributionKeys.list(INITIAL_OPTIONS),
    queryFn: () => getContributions(INITIAL_OPTIONS),
  });

  const allQuery = useQuery({
    ...contributionKeys.list(ALL_OPTIONS),
    queryFn: () => getContributions(ALL_OPTIONS),
    enabled: loadingMode === 'all',
  });

  const current =
    loadingMode === 'all' && allQuery.data ? allQuery.data : initialQuery.data;

  return {
    isPending: initialQuery.isPending,
    contributions: current?.data ?? [],
    totalCount: current?.total ?? 0,
    loadedCount: current?.data?.length ?? 0,
    isLoadingAll: loadingMode === 'all' && allQuery.isPending,
    hasLoadedAll:
      loadingMode === 'all' && !allQuery.isPending && !!allQuery.data,
    isEmpty: current?.data?.length === 0,

    loadAll: () => setLoadingMode('all'),
    refresh: () => {
      void queryClient.invalidateQueries({
        queryKey: contributionKeys.list(INITIAL_OPTIONS).queryKey,
      });
      if (loadingMode === 'all') {
        void queryClient.invalidateQueries({
          queryKey: contributionKeys.list(ALL_OPTIONS).queryKey,
        });
      }
    },
  };
}
