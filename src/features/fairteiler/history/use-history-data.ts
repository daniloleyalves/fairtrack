'use client';

import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { FAIRTEILER_CONTRIBUTIONS_KEY } from '@/lib/config/api-routes';
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

export function useHistoryData() {
  const [loadingMode, setLoadingMode] = useState<'initial' | 'all'>('initial');

  // SWR with Suspense for initial 100 items
  const initialData = useSWRSuspense<PaginatedResponse>(
    `${FAIRTEILER_CONTRIBUTIONS_KEY}?limit=100`,
    {
      fetcher,
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  // SWR with Suspense for all data (only when requested)
  const allData = useSWR<PaginatedResponse>(
    loadingMode === 'all' && `${FAIRTEILER_CONTRIBUTIONS_KEY}?limit=100000`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  // Use allData only if it has successfully loaded, otherwise fall back to initialData
  const currentData =
    loadingMode === 'all' && allData.data ? allData.data : initialData.data;

  return {
    contributions: currentData?.data ?? [],
    totalCount: currentData?.pagination?.total ?? 0,
    loadedCount: currentData?.data?.length ?? 0,
    isLoadingAll: loadingMode === 'all' && allData.isLoading,
    hasLoadedAll: loadingMode === 'all' && !allData.isLoading && !!allData.data,
    isEmpty: currentData?.data?.length === 0,

    // Actions
    loadAll: () => setLoadingMode('all'),
    refresh: () => {
      initialData.mutate();
      if (loadingMode === 'all') allData.mutate();
    },
  };
}
