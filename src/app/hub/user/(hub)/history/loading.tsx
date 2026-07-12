import { Skeleton } from '@/components/ui/skeleton';
import { UserHistoryTableSkeleton } from '@/features/user/history/components/user-history-table-skeleton';

export default function UserHistoryLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-6'>
        <Skeleton variant='onCard' className='mb-2 h-8 w-48 rounded-md' />
        <Skeleton variant='onCard' className='h-5 w-80 rounded-md' />
      </div>

      <UserHistoryTableSkeleton />
    </div>
  );
}
