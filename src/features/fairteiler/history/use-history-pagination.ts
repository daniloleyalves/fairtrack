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
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
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

  const currentData = loadingMode === 'all' ? allData.data : initialData.data;

  return {
    contributions: currentData?.data ?? [],
    totalCount: currentData?.pagination?.total ?? 0,
    loadedCount: currentData?.data?.length ?? 0,
    isLoadingAll: loadingMode === 'all' && allData.isLoading,
    hasLoadedAll: loadingMode === 'all' && !allData.isLoading,
    isEmpty: currentData?.data?.length === 0,

    // Actions
    loadAll: () => setLoadingMode('all'),
    refresh: () => {
      initialData.mutate();
      if (loadingMode === 'all') allData.mutate();
    },
  };
}

// Separate pagination state hook (independent of data loading)
export function usePaginationState(initialPageSize = 10) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return {
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,

    // Helper functions
    goToPage: (page: number) => setPageIndex(page),
    nextPage: () => setPageIndex((prev) => prev + 1),
    previousPage: () => setPageIndex((prev) => Math.max(0, prev - 1)),
    resetToFirstPage: () => setPageIndex(0),
  };
}
