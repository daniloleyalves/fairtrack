import { Skeleton } from '@/components/ui/skeleton';
import { UserDashboardGridSkeleton } from '@/features/user/dashboard/user-dashboard-grid-skeleton';

export default function UserDashboardLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <h2 className='mb-8 flex items-center gap-2 font-londrina text-4xl font-bold tracking-wider text-white md:mb-4'>
        <Skeleton className='h-9 w-[75px]' />
        <Skeleton className='h-9 w-[250px]' />
      </h2>
      <UserDashboardGridSkeleton />
    </div>
  );
}
