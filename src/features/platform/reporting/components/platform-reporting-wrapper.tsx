'use client';

import { useQuery } from '@tanstack/react-query';
import { getContributions } from '@/server/contribution/queries';
import { contributionKeys } from '@/server/contribution/query-keys';
import { getFairteilers } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { PlatformReportingDashboard } from './platform-reporting-dashboard';
import { PlatformReportingGridSkeleton } from './platform-reporting-grid-skeleton';

const PLATFORM_REPORTING_QUERY_OPTIONS = {
  platformWide: true,
  limit: 100000,
} as const;

export default function PlatformReportingWrapper() {
  const contributionsQuery = useQuery({
    ...contributionKeys.list(PLATFORM_REPORTING_QUERY_OPTIONS),
    queryFn: () => getContributions(PLATFORM_REPORTING_QUERY_OPTIONS),
  });

  const fairteilersQuery = useQuery({
    ...fairteilerKeys.list(),
    queryFn: () => getFairteilers(),
  });

  if (contributionsQuery.isPending || fairteilersQuery.isPending) {
    return <PlatformReportingGridSkeleton />;
  }

  if (contributionsQuery.error) {
    throw contributionsQuery.error;
  }
  if (fairteilersQuery.error) {
    throw fairteilersQuery.error;
  }

  if (!contributionsQuery.data || !fairteilersQuery.data) {
    throw new Error('Berichtsdaten nicht gefunden.');
  }

  return (
    <PlatformReportingDashboard
      data={contributionsQuery.data.data}
      fairteilers={fairteilersQuery.data}
    />
  );
}
