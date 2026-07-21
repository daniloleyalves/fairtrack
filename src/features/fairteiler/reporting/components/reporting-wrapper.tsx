'use client';

import { useQuery } from '@tanstack/react-query';
import { getContributions } from '@/server/contribution/queries';
import { contributionKeys } from '@/server/contribution/query-keys';
import { ReportingDashboard } from './reporting-dashboard';
import { ReportingGridSkeleton } from './reporting-grid-skeleton';

const REPORTING_QUERY_OPTIONS = { limit: 100000 } as const;

export default function FairteilerReportingWrapper() {
  const { data, isPending, error } = useQuery({
    ...contributionKeys.list(REPORTING_QUERY_OPTIONS),
    queryFn: () => getContributions(REPORTING_QUERY_OPTIONS),
  });

  if (isPending) {
    return <ReportingGridSkeleton />;
  }

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Berichtsdaten nicht gefunden.');
  }

  return <ReportingDashboard data={data.data} />;
}
