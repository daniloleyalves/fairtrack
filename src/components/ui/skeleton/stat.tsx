import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface StatSkeletonProps {
  /** Number of stat tiles to render. */
  count: number;
  /**
   * `'icon-label'` — circular icon (h-12 w-12) + label bar (h-6 w-24).
   * Used for dashboard top-row stats.
   *
   * `'number-unit-desc'` — big number (h-8 w-16) + unit (h-4 w-8) + caption
   * (h-4 w-20), centered inside a bordered card. Used for reporting key-figures.
   */
  variant: 'icon-label' | 'number-unit-desc';
  className?: string;
}

export function StatSkeleton({ count, variant, className }: StatSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        variant === 'icon-label'
          ? 'grid-cols-2 md:grid-cols-3'
          : 'grid-cols-2 md:grid-cols-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) =>
        variant === 'icon-label' ? (
          <div
            key={i}
            className='flex items-center gap-3 rounded-lg border bg-card p-4'
          >
            <Skeleton variant='onCard' className='size-12 rounded-full' />
            <Skeleton variant='onCard' className='h-6 w-24' />
          </div>
        ) : (
          <div
            key={i}
            className='flex flex-col items-center gap-2 rounded-lg border-4 bg-card p-4'
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
