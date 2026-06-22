'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, StatSkeleton } from '@/components/ui/skeleton';
import { contributionKeys } from '@/server/contribution/query-keys';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { PlatformReportingDashboard } from './platform-reporting-dashboard';

const PLATFORM_REPORTING_QUERY_OPTIONS = {
  platformWide: true,
  limit: 100000,
} as const;

export default function PlatformReportingWrapper() {
  const contributionsQuery = useQuery(
    contributionKeys.list(PLATFORM_REPORTING_QUERY_OPTIONS),
  );

  const fairteilersQuery = useQuery(fairteilerKeys.list());

  if (
    contributionsQuery.isPending ||
    !contributionsQuery.data ||
    fairteilersQuery.isPending ||
    !fairteilersQuery.data
  ) {
    return <PlatformReportingGridSkeleton />;
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
        <Skeleton variant='onCard' className='h-9 w-48' />
      </div>

      {/* Filter Card */}
      <Card className='flex flex-col py-0 lg:flex-row'>
        <CardContent className='flex flex-wrap items-center gap-4 py-4'>
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

      {/* Geographic Map */}
      <Card>
        <CardHeader>
          <Skeleton variant='onCard' className='h-6 w-32' />
        </CardHeader>
        <CardContent>
          <div className='relative h-[580px]'>
            <Skeleton variant='onCard' className='size-full rounded-lg' />
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
