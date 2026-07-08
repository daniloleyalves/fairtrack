import { Skeleton } from '@ui/skeleton';

export function CatalogSelectionSkeleton({ title }: { title: string }) {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-2 text-lg font-semibold'>{title}</h3>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40 bg-secondary' />
            <Skeleton className='h-10 w-full rounded-lg bg-secondary' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40 bg-secondary' />
            <Skeleton className='h-32 w-full rounded-lg bg-secondary' />
          </div>
        </div>
      </div>
    </div>
  );
}
