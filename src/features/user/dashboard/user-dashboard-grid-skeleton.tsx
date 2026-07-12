import { Card } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

export function UserDashboardGridSkeleton() {
  return (
    <div className='grid grid-cols-12 gap-4'>
      {/* Main Statistics */}
      <div className='md:col-span1 order-1 col-span-12 flex flex-col gap-2 md:flex-row lg:col-span-4 lg:flex-col'>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card
            key={i}
            className='flex h-full w-full flex-col items-center justify-center p-4'
          >
            <Skeleton variant='onCard' className='size-12 rounded-full' />
            <Skeleton variant='onCard' className='mt-1 h-6 w-3/4 rounded-md' />
          </Card>
        ))}
      </div>

      {/* Milestones */}
      <div className='order-2 col-span-12 md:order-3 md:col-span-2 lg:col-span-1'>
        <Card className='h-full p-4'>
          <Skeleton variant='onCard' className='h-6 rounded-md' />
          <div className='mt-4 space-y-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex flex-col items-center gap-2'>
                <Skeleton variant='onCard' className='size-8 rounded-full' />
                <Skeleton variant='onCard' className='h-4 w-full rounded-md' />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className='order-3 col-span-12 w-full md:order-2 md:col-span-10 lg:col-span-7'>
        <Card className='h-full flex-col justify-between gap-4 rounded-lg bg-white p-4 md:gap-0'>
          <Skeleton variant='onCard' className='h-36 w-full rounded-md' />
          <div className='hidden h-px w-full bg-border md:block' />
          <div className='h-full w-px bg-border md:hidden' />
          <Skeleton variant='onCard' className='h-36 w-full rounded-md' />
        </Card>
      </div>

      {/* Bottom Row Content */}
      <div className='order-4 col-span-12 flex flex-col-reverse gap-4 md:col-span-10 lg:col-span-11 lg:flex-row'>
        {/* Recent Contributions */}
        <Card className='w-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton variant='onCard' className='h-6 w-1/3 rounded-md' />
          <TableSkeleton rows={12} columns={3} />
        </Card>

        {/* Data Calendar */}
        <Card className='h-max w-full flex-col gap-4 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <Skeleton variant='onCard' className='h-6 w-1/3 rounded-md' />
            <Skeleton variant='onCard' className='h-6 w-6' />
          </div>
          <div className='flex items-center justify-between'>
            <Skeleton variant='onCard' className='h-4 w-4' />
            <Skeleton variant='onCard' className='mx-auto h-4 w-24' />
            <Skeleton variant='onCard' className='h-4 w-4' />
          </div>
          <div className='flex w-full justify-around gap-2'>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} variant='onCard' className='h-4 w-8' />
            ))}
          </div>
          <div className='grid h-full grid-cols-7 grid-rows-4 gap-1'>
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} variant='onCard' className='aspect-square' />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
