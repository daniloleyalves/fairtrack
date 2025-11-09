'use client';

import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { USER_CONTRIBUTIONS_KEY } from '@/lib/config/api-routes';
import { vContribution } from '@/server/db/db-types';
import { useState } from 'react';
import useSWR from 'swr';

interface PaginatedResponse {
  data: vContribution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export function useUserHistoryData() {
  const [loadingMode, setLoadingMode] = useState<'initial' | 'all'>('initial');

  // SWR with Suspense for initial 100 items
  const initialData = useSWRSuspense<PaginatedResponse>(
    `${USER_CONTRIBUTIONS_KEY}?limit=100`,
    {
      fetcher,
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  // SWR with Suspense for all data (only when requested)
  const allData = useSWR<PaginatedResponse>(
    loadingMode === 'all' && `${USER_CONTRIBUTIONS_KEY}?limit=100000`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  // Use allData only if it has successfully loaded, otherwise fall back to initialData
  const currentData =
    loadingMode === 'all' && allData.data ? allData.data : initialData.data;

  const totalCount = currentData?.pagination?.total ?? 0;
  const loadedCount = currentData?.data?.length ?? 0;

  return {
    contributions: currentData?.data ?? [],
    totalCount,
    loadedCount,
    isLoadingAll: loadingMode === 'all' && allData.isLoading,
    hasLoadedAll:
      (loadingMode === 'all' && !allData.isLoading && !!allData.data) ||
      loadedCount === totalCount,
    isEmpty: currentData?.data?.length === 0,

    // Actions
    loadAll: () => setLoadingMode('all'),
    refresh: () => {
      initialData.mutate();
      if (loadingMode === 'all') allData.mutate();
    },
  };
}
