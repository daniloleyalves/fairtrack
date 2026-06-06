import { cn } from '@/lib/utils';
import { Skeleton, type SkeletonVariant } from './skeleton';

interface CardSkeletonProps extends React.ComponentProps<'div'> {
  /** Tailwind height class (e.g. `'h-8 w-[153px]'`) when used as a single shape. */
  height?: string;
  /** Forwarded to the inner skeleton bar. Default `'onPage'`. */
  variant?: SkeletonVariant;
}

/**
 * Card-shaped placeholder. With `children`, renders a bordered/padded
 * container that consumers fill with their own primitive bars. Without
 * `children`, renders a single rounded bar at `height` (use the `height`
 * prop instead of `className` for the common single-bar case).
 */
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
