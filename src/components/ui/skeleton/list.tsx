import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface ListSkeletonProps {
  rows: number;
  showAvatar?: boolean;
  showTrailing?: boolean;
  title?: boolean;
  className?: string;
}

export function ListSkeleton({
  rows,
  showAvatar = false,
  showTrailing = false,
  title = false,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {title && <Skeleton variant='onCard' className='h-5 w-32' />}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex items-center gap-3'>
          {showAvatar && (
            <Skeleton variant='onCard' className='size-8 rounded-full' />
          )}
          <Skeleton variant='onCard' className='h-4 flex-1' />
          {showTrailing && <Skeleton variant='onCard' className='h-4 w-10' />}
        </div>
      ))}
    </div>
  );
}
