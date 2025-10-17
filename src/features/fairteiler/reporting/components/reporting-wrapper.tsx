'use client';

import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { vContribution } from '@/server/db/db-types';
import { SWRConfig } from 'swr';
import { ReportingDashboard } from './reporting-dashboard';
import { FAIRTEILER_CONTRIBUTIONS_KEY } from '@/lib/config/api-routes';

export default function FairteilerReportingWrapper() {
  const { data } = useSWRSuspense<{
    data: vContribution[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }>(`${FAIRTEILER_CONTRIBUTIONS_KEY}?limit=100000`, {
    fetcher,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
  });

  console.log(data);

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateIfStale: false,
        revalidateOnReconnect: true,
      }}
    >
      <ReportingDashboard data={data.data} />
    </SWRConfig>
  );
}
