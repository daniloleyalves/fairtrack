import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface StatSkeletonProps {
  count: number;
  variant: 'icon-label' | 'number-unit-desc';
  className?: string;
}

export function StatSkeleton({ count, variant, className }: StatSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) =>
        variant === 'icon-label' ? (
          <div
            key={i}
            className='flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm'
          >
            <Skeleton variant='onCard' className='size-12 rounded-full' />
            <Skeleton variant='onCard' className='h-6 w-24' />
          </div>
        ) : (
          <div
            key={i}
            className='flex flex-col items-center gap-2 rounded-lg border-4 border-white bg-card p-4 shadow-sm'
          >
            <Skeleton variant='onCard' className='h-8 w-16' />
            <Skeleton variant='onCard' className='h-4 w-8' />
            <Skeleton variant='onCard' className='h-4 w-20' />
          </div>
        ),
      )}
    </div>
  );
}
