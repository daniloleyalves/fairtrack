import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function UserDashboardSkeleton() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-8 flex items-center justify-between gap-2 md:mb-4 md:flex-row'>
        <h2 className='flex items-center gap-2 font-londrina text-4xl font-bold tracking-wider text-white'>
          <Skeleton className='h-9 w-[75px]' />
          <Skeleton className='h-9 w-[250px]' />
        </h2>
        <div className='hidden gap-2 md:flex'>
          <Skeleton className='h-9 w-[160px]' />
          <Skeleton className='h-9 w-[240px]' />
        </div>
      </div>
      <div className='grid grid-cols-12 gap-4'>
        {/* Main Statistics */}
        <div className='md:col-span1 order-1 col-span-12 flex flex-col gap-2 md:flex-row lg:col-span-4 lg:flex-col'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className='flex h-32 w-full flex-col items-center justify-center p-4'
            >
              <Skeleton className='size-12 rounded-full bg-secondary' />
              <Skeleton className='mt-2 h-4 w-1/2 rounded-md bg-secondary' />
              <Skeleton className='mt-1 h-6 w-3/4 rounded-md bg-secondary' />
            </Card>
          ))}
        </div>

        {/* Milestones */}
        <div className='order-2 col-span-12 md:order-3 md:col-span-2 lg:col-span-1'>
          <Card className='h-full p-4'>
            <Skeleton className='h-6 w-3/4 rounded-md bg-secondary' />
            <div className='mt-4 space-y-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <Skeleton className='size-8 rounded-full bg-secondary' />
                  <Skeleton className='h-4 w-full rounded-md bg-secondary' />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className='order-3 col-span-12 w-full md:order-2 md:col-span-10 lg:col-span-7'>
          <Card className='h-full flex-col gap-4 rounded-lg bg-white p-4 md:gap-0 md:py-2'>
            <div className='flex-1 space-y-4'>
              <Skeleton className='h-6 w-1/2 rounded-md bg-secondary' />
              <Skeleton className='h-32 w-full rounded-md bg-secondary' />
            </div>
            <div className='hidden h-px w-full bg-border md:block' />
            <div className='h-full w-px bg-border md:hidden' />
            <div className='flex-1 space-y-4'>
              <Skeleton className='h-6 w-1/2 rounded-md bg-secondary' />
              <Skeleton className='h-32 w-full rounded-md bg-secondary' />
            </div>
          </Card>
        </div>

        {/* Bottom Row Content */}
        <div className='order-4 col-span-12 flex flex-col-reverse gap-4 md:col-span-10 lg:col-span-11 lg:flex-row'>
          {/* Recent Contributions */}
          <Card className='w-full flex-col gap-4 rounded-lg p-4'>
            <Skeleton className='h-6 w-1/3 rounded-md bg-secondary' />
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

          {/* Data Calendar */}
          <Card className='w-full flex-col gap-4 rounded-lg p-4'>
            <Skeleton className='h-6 w-1/3 rounded-md bg-secondary' />
            <div className='grid h-full grid-cols-7 grid-rows-4 gap-1'>
              {Array.from({ length: 28 }).map((_, i) => (
                <Skeleton key={i} className='aspect-square bg-secondary' />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
