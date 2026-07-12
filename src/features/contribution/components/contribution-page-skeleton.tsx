import { Skeleton } from '@components/ui/skeleton';

export function ContributionPageSkeleton() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-3 sm:mx-8'>
      {/* Page Title and Buttons Skeleton */}
      <div className='mb-4 flex flex-col items-center gap-2 text-center text-white sm:flex-row sm:justify-between sm:text-start'>
        <Skeleton variant='onCard' className='h-10 w-48 sm:w-64' />
        <div className='flex flex-wrap gap-2 self-center sm:self-start'>
          <Skeleton variant='onCard' className='h-9 w-40 rounded-md' />
          <Skeleton variant='onCard' className='h-9 w-32 rounded-md' />
          <Skeleton variant='onCard' className='h-9 w-56 rounded-md' />
        </div>
      </div>

      {/* Main Card Skeleton (mimics ContributionTable Card) */}
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
        <div className='p-4 md:p-6'>
          <div className='flex h-[245px] flex-col gap-2 rounded-lg border bg-card'>
            <div className='flex h-[40px] gap-3 border-b p-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant='onCard' className='h-3 flex-1' />
              ))}
            </div>
            <div className='h-[125px] border-b' />
            <div className='flex items-center justify-center'>
              <Skeleton className='h-12 w-12 rounded-full bg-secondary' />
            </div>
          </div>
          <div className='mt-4 flex w-full items-start justify-between gap-4 md:items-center'>
            <div className='flex items-center gap-2'>
              <Skeleton variant='onCard' className='h-6 w-9 rounded-full' />
              <Skeleton variant='onCard' className='h-4 w-28' />
            </div>
            <Skeleton variant='onCard' className='h-9 w-32 rounded-md' />
          </div>
        </div>
      </div>
    </div>
  );
}
