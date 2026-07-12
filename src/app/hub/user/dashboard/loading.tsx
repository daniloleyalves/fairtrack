import { Skeleton } from '@/components/ui/skeleton';
import { UserDashboardGridSkeleton } from '@/features/user/dashboard/user-dashboard-grid-skeleton';

export default function UserDashboardLoading() {
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
      <UserDashboardGridSkeleton />
    </div>
  );
}
