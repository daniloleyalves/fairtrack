import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FairteilerReportingLoading() {
  return (
    <div className='flex flex-col gap-6'>
      {/* Export Button Skeleton */}
      <div className='flex items-center justify-end'>
        <Skeleton className='h-9 w-32 bg-secondary' />
      </div>

      {/* Filter Card Skeleton */}
      <Card className='flex flex-col py-0 lg:flex-row'>
        <CardContent className='flex flex-wrap items-center gap-4 py-4'>
          <Skeleton className='h-6 w-12 bg-secondary' /> {/* "Filter:" label */}
          {/* Date Range Picker */}
          <Skeleton className='h-9 w-64 bg-secondary' />
          {/* Filter Dropdowns */}
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
              <Skeleton className='h-8 w-16 bg-secondary' /> {/* Number */}
              <Skeleton className='h-4 w-20 bg-secondary' /> {/* Unit */}
              <Skeleton className='h-4 w-24 bg-secondary' /> {/* Description */}
            </div>
          </Card>
        ))}
      </div>

      {/* Volume Trend Chart */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-64 bg-secondary' /> {/* Chart title */}
        </CardHeader>
        <CardContent>
          <div className='flex h-80 items-end justify-between space-x-2'>
            {/* Chart bars simulation */}
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className='w-full bg-secondary'
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
          {/* Chart legend */}
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
            {/* Line chart simulation */}
            <Skeleton className='h-full w-full rounded-lg bg-secondary' />
          </div>
        </CardContent>
      </Card>

      {/* Attribution Distribution Charts Grid */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between'>
              <Skeleton className='h-6 w-24 bg-secondary' /> {/* Chart title */}
              <Skeleton className='size-8 rounded bg-secondary' />{' '}
              {/* Download button */}
            </CardHeader>
            <CardContent className='flex flex-row gap-8'>
              <div className='flex items-center justify-center'>
                {/* Pie chart simulation */}
                <Skeleton className='h-36 w-36 rounded-full bg-secondary' />
              </div>
              {/* Legend */}
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
    </div>
  );
}
