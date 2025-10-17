import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function FairteilerFinderLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      {/* Header Section */}
      <div className='mb-4 hidden items-end justify-between md:flex'>
        <Skeleton className='h-10 w-64 rounded-md bg-secondary' />
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-32 rounded-md bg-secondary' />
          <Skeleton className='h-10 w-24 rounded-md bg-secondary' />
          <Skeleton className='size-10 rounded-md bg-secondary' />
        </div>
      </div>

      {/* Map Container */}
      <Card className='relative h-[calc(100vh-12rem)] w-full overflow-hidden rounded-lg'>
        {/* Map Loading Placeholder */}
        <div className='absolute inset-0 flex items-center justify-center bg-muted'>
          <div className='flex flex-col items-center gap-4'>
            <Skeleton className='size-16 rounded-full bg-secondary' />
            <Skeleton className='h-4 w-32 rounded-md bg-secondary' />
          </div>
        </div>

        {/* Map Controls Skeleton */}
        <div className='absolute top-4 right-4 flex flex-col gap-2'>
          <Skeleton className='size-10 rounded-md bg-secondary' />
          <Skeleton className='size-10 rounded-md bg-secondary' />
        </div>

        {/* Search Bar Skeleton */}
        <div className='absolute top-4 left-4 w-80'>
          <Skeleton className='h-10 w-full rounded-md bg-secondary' />
        </div>

        {/* Filter Controls Skeleton */}
        <div className='absolute bottom-4 left-4 flex gap-2'>
          <Skeleton className='h-8 w-20 rounded-md bg-secondary' />
          <Skeleton className='h-8 w-24 rounded-md bg-secondary' />
          <Skeleton className='h-8 w-16 rounded-md bg-secondary' />
        </div>
      </Card>
    </div>
  );
}
