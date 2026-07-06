'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getContributions } from '@/server/contribution/queries';
import { contributionKeys } from '@/server/contribution/query-keys';
import { getFairteilers } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { PlatformReportingDashboard } from './platform-reporting-dashboard';

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

  if (
    contributionsQuery.error ||
    !contributionsQuery.data ||
    fairteilersQuery.error ||
    !fairteilersQuery.data
  ) {
    return (
      <p className='text-center text-sm text-muted-foreground'>
        Beim Laden der Berichte ist ein unerwarteter Fehler aufgetreten.
      </p>
    );
  }

  return (
    <PlatformReportingDashboard
      data={contributionsQuery.data.data}
      fairteilers={fairteilersQuery.data}
    />
  );
}

function PlatformReportingGridSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      {/* Export Button */}
      <div className='flex items-center justify-end'>
        <Skeleton className='h-9 w-48 bg-secondary' />
      </div>

      {/* Filter Card */}
      <Card className='flex flex-col py-0 lg:flex-row'>
        <CardContent className='flex flex-wrap items-center gap-4 py-4'>
          <Skeleton className='h-6 w-12 bg-secondary' />
          <Skeleton className='h-9 w-64 bg-secondary' />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-9 w-28 bg-secondary' />
          ))}
        </CardContent>
      </Card>

      {/* Key Figures Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='border-4 border-white p-4'>
            <div className='flex flex-col items-center justify-center space-y-2'>
              <Skeleton className='h-8 w-16 bg-secondary' />
              <Skeleton className='h-4 w-20 bg-secondary' />
              <Skeleton className='h-4 w-24 bg-secondary' />
            </div>
          </Card>
        ))}
      </div>

      {/* Attribution Distribution Charts */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between'>
              <Skeleton className='h-6 w-24 bg-secondary' />
              <Skeleton className='size-8 rounded bg-secondary' />
            </CardHeader>
            <CardContent className='flex flex-row gap-8'>
              <div className='flex items-center justify-center'>
                <Skeleton className='h-36 w-36 rounded-full bg-secondary' />
              </div>
              <div className='grid grid-cols-2 gap-4 gap-x-8'>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className='flex items-center gap-2'>
                    <Skeleton className='size-3 rounded-full bg-secondary' />
                    <Skeleton className='h-4 w-24 bg-secondary' />
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
          <Skeleton className='h-6 w-64 bg-secondary' />
        </CardHeader>
        <CardContent>
          <div className='flex h-80 items-end justify-between space-x-2'>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className='w-full bg-secondary'
                style={{ height: `${(i + 1) * 7 + 20}%` }}
              />
            ))}
          </div>
          <div className='mt-4 flex justify-center gap-4'>
            <Skeleton className='h-4 w-20 bg-secondary' />
            <Skeleton className='h-4 w-20 bg-secondary' />
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Trend Chart */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48 bg-secondary' />
        </CardHeader>
        <CardContent>
          <div className='relative h-80'>
            <Skeleton className='h-full w-full rounded-lg bg-secondary' />
          </div>
        </CardContent>
      </Card>

      {/* Geographic Map */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32 bg-secondary' />
        </CardHeader>
        <CardContent>
          <div className='relative h-[580px]'>
            <Skeleton className='h-full w-full rounded-lg bg-secondary' />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className='absolute size-4 rounded-full bg-muted-foreground'
                style={{
                  top: `${10 + ((i * 11) % 80)}%`,
                  left: `${10 + ((i * 17) % 80)}%`,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
