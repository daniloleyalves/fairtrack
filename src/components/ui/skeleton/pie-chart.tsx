import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface PieChartSkeletonProps {
  /** How many legend rows to render alongside the pie. Default 6. */
  legendItems?: number;
  className?: string;
}

export function PieChartSkeleton({
  legendItems = 6,
  className,
}: PieChartSkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-6 rounded-lg border bg-card p-4',
        className,
      )}
    >
      <Skeleton variant='onCard' className='size-32 rounded-full' />
      <div className='flex flex-1 flex-col gap-2'>
        {Array.from({ length: legendItems }).map((_, i) => (
          <div key={i} className='flex items-center gap-2'>
            <Skeleton variant='onCard' className='size-3 rounded-sm' />
            <Skeleton variant='onCard' className='h-3 flex-1' />
          </div>
        ))}
      </div>
    </div>
  );
}
