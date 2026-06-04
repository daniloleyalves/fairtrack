import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface TableSkeletonProps {
  /** Number of body row placeholders. */
  rows: number;
  /** Number of column placeholders per row (also drives the header). */
  columns: number;
  /** Render a top toolbar/filter bar above the table. */
  showToolbar?: boolean;
  /** Render pagination controls below the table. */
  showPagination?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows,
  columns,
  showToolbar = false,
  showPagination = false,
  className,
}: TableSkeletonProps) {
  const cols = Array.from({ length: columns });
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {showToolbar && (
        <div className='flex items-center gap-2'>
          <Skeleton variant='onCard' className='h-9 w-64' />
          <Skeleton variant='onCard' className='h-9 w-32' />
        </div>
      )}
      <div className='flex flex-col gap-2 rounded-lg border bg-card p-4'>
        <div className='flex gap-3 border-b pb-3'>
          {cols.map((_, i) => (
            <Skeleton key={i} variant='onCard' className='h-4 flex-1' />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className='flex gap-3 py-2'>
            {cols.map((_, c) => (
              <Skeleton key={c} variant='onCard' className='h-4 flex-1' />
            ))}
          </div>
        ))}
      </div>
      {showPagination && (
        <div className='flex items-center justify-between'>
          <Skeleton variant='onCard' className='h-4 w-32' />
          <div className='flex gap-2'>
            <Skeleton variant='onCard' className='size-9' />
            <Skeleton variant='onCard' className='size-9' />
          </div>
        </div>
      )}
    </div>
  );
}
