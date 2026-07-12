import { Skeleton } from '@ui/skeleton';
import { ContributionPageSkeleton } from '@/features/contribution/components/contribution-page-skeleton';

export default function Loading() {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Contribution header bar */}
      <div className='flex items-center gap-3 rounded-b-lg border-b bg-card p-4 sm:gap-4'>
        <Skeleton variant='onCard' className='h-8 w-20' />
        <div className='flex-1 space-y-2'>
          <Skeleton variant='onCard' className='h-6 w-48' />
          <Skeleton variant='onCard' className='h-4 w-32' />
        </div>
      </div>

      <ContributionPageSkeleton />
    </div>
  );
}
