import { cn } from '@/lib/utils';

export type SkeletonVariant = 'onPage' | 'onCard';

interface SkeletonProps extends React.ComponentProps<'div'> {
  variant?: SkeletonVariant;
}

export function Skeleton({
  variant = 'onPage',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      data-slot='skeleton'
      className={cn(
        'animate-pulse rounded-lg',
        variant === 'onPage' ? 'bg-white' : 'bg-secondary',
        className,
      )}
      {...props}
    />
  );
}
