'use client';

import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { PlatformReportingDashboard } from './platform-reporting-dashboard';
import { Fairteiler, vContribution } from '@/server/db/db-types';
import {
  PLATFORM_CONTRIBUTIONS_KEY,
  PLATFORM_FAIRTEILERS_KEY,
} from '@/lib/config/api-routes';

export default function PlatformReportingWrapper() {
  const { data } = useSWRSuspense<{
    data: vContribution[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }>(`${PLATFORM_CONTRIBUTIONS_KEY}?limit=100000`, {
    fetcher,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
  });

  const { data: fairteilers } = useSWRSuspense<Fairteiler[]>(
    PLATFORM_FAIRTEILERS_KEY,
    {
      fetcher,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  return (
    <PlatformReportingDashboard data={data.data} fairteilers={fairteilers} />
  );
}
