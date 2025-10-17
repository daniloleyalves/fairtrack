import { Skeleton } from '@components/ui/skeleton';
import { DataErrorBoundary } from '@components/error-boundary';
import { Suspense } from 'react';
import { Card } from '@components/ui/card';
import FairteilerDashboardWrapper from '@/features/fairteiler/dashboard/components/fairteiler-dashboard-wrapper';

export default function FairteilerDashboardPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <h2 className='flex justify-center gap-2 font-londrina text-4xl font-bold tracking-wider text-white sm:justify-start'>
        Fairteiler Dashboard
      </h2>

      <DataErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <FairteilerDashboardWrapper />
        </Suspense>
      </DataErrorBoundary>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className='grid grid-cols-12 gap-4'>
      {/* Left Column Content Skeleton */}
      <div className='col-span-12 flex flex-col gap-4 lg:col-span-7'>
        {/* Key Figures Skeletons */}
        <div className='flex gap-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className='flex h-32 w-full flex-col items-center justify-center p-4'
            >
              <Skeleton className='size-12 rounded-full bg-secondary' />
              <Skeleton className='h-4 w-1/3 rounded-md bg-secondary' />
            </Card>
          ))}
        </div>

        {/* Attribute Distribution Charts Skeleton */}
        <Card className='flex flex-col gap-4 rounded-lg p-4'>
          <div className='flex-1 space-y-4'>
            <Skeleton className='h-6 w-3/4 rounded-md bg-secondary' />
            <Skeleton className='h-28 w-full rounded-md bg-secondary' />{' '}
            {/* Placeholder for chart area */}
          </div>
          <div className='h-full w-px bg-border md:hidden' />
          <div className='flex-1 space-y-4'>
            <Skeleton className='h-6 w-3/4 rounded-md bg-secondary' />
            <Skeleton className='h-28 w-full rounded-md bg-secondary' />{' '}
            {/* Placeholder for chart area */}
          </div>
        </Card>
      </div>

      {/* Right Column Content (Leaderboard) Skeleton */}
      <div className='relative col-span-12 lg:col-span-5'>
        <Card className='h-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton className='h-8 w-1/2 rounded-md bg-secondary' />
          <div className='space-y-3'>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='size-8 rounded-full bg-secondary' />
                <Skeleton className='h-4 w-24 rounded-md bg-secondary' />
                <Skeleton className='ml-auto h-4 w-16 rounded-md bg-secondary' />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row Content Skeletons */}
      <div className='col-span-12 flex flex-col-reverse gap-4 lg:flex-row'>
        {/* Recent Contributions Skeleton */}
        <Card className='h-max flex-col gap-4 rounded-lg p-4 not-even:w-full'>
          <Skeleton className='h-8 w-1/2 rounded-md bg-secondary' />
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='size-8 rounded-md bg-secondary' />
                <Skeleton className='h-4 w-3/4 rounded-md bg-secondary' />
                <Skeleton className='ml-auto h-4 w-12 rounded-md bg-secondary' />
              </div>
            ))}
          </div>
        </Card>

        {/* Data Calendar Skeleton */}
        <Card className='w-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton className='h-8 w-1/3 rounded-md bg-secondary' />
          <div className='grid h-full grid-cols-7 grid-rows-4 gap-1'>
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className='aspect-square bg-secondary' />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
