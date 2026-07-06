'use client';

import { useQuery } from '@tanstack/react-query';
import { SWRConfig } from 'swr';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, StatSkeleton } from '@/components/ui/skeleton';
import { fetcher } from '@/lib/services/swr';
import { getContributions } from '@/server/contribution/queries';
import { contributionKeys } from '@/server/contribution/query-keys';
import { ReportingDashboard } from './reporting-dashboard';

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

function ReportingGridSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      {/* Export Button */}
      <div className='flex items-center justify-center sm:justify-end'>
        <Skeleton variant='onCard' className='h-9 w-32' />
      </div>

      {/* Filter Card */}
      <Card className='flex flex-col py-0 lg:flex-row'>
        <CardContent className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 sm:justify-start'>
          <Skeleton variant='onCard' className='h-6 w-12' />
          <Skeleton variant='onCard' className='h-9 w-64' />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant='onCard' className='h-9 w-28' />
          ))}
        </CardContent>
      </Card>

      {/* Key Figures Grid */}
      <StatSkeleton
        count={4}
        variant='number-unit-desc'
        className='grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      />

      {/* Attribution Distribution Charts */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between'>
              <Skeleton variant='onCard' className='h-6 w-24' />
              <Skeleton variant='onCard' className='size-8 rounded' />
            </CardHeader>
            <CardContent className='flex flex-row gap-8'>
              <div className='flex items-center justify-center'>
                <Skeleton variant='onCard' className='size-36 rounded-full' />
              </div>
              <div className='grid grid-cols-2 gap-4 gap-x-8'>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className='flex items-center gap-2'>
                    <Skeleton
                      variant='onCard'
                      className='size-3 rounded-full'
                    />
                    <Skeleton variant='onCard' className='h-4 w-24' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Volume Trend Chart */}
      <Card>
        <CardHeader>
          <Skeleton variant='onCard' className='h-6 w-64' />
        </CardHeader>
        <CardContent>
          <div className='flex h-80 items-end justify-between space-x-2'>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                variant='onCard'
                className='w-full'
                style={{ height: `${(i + 1) * 7 + 20}%` }}
              />
            ))}
          </div>
          <div className='mt-4 flex justify-center gap-4'>
            <Skeleton variant='onCard' className='h-4 w-20' />
            <Skeleton variant='onCard' className='h-4 w-20' />
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Trend Chart */}
      <Card>
        <CardHeader>
          <Skeleton variant='onCard' className='h-6 w-48' />
        </CardHeader>
        <CardContent>
          <div className='relative h-80'>
            <Skeleton variant='onCard' className='size-full rounded-lg' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
