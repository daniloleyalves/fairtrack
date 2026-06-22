import { cn } from '@/lib/utils';
import { Skeleton, type SkeletonVariant } from './skeleton';

interface CardSkeletonProps extends React.ComponentProps<'div'> {
  height?: string;
  variant?: SkeletonVariant;
}

export function CardSkeleton({
  height,
  className,
  variant,
  children,
  ...props
}: CardSkeletonProps) {
  if (children) {
    return (
      <div
        className={cn(
          'flex flex-col gap-4 rounded-lg border bg-card p-6',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <Skeleton variant={variant} className={cn(height, className)} {...props} />
  );
}
