import { Skeleton } from '@components/ui/skeleton';

export default function Loading() {
  return (
    <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <Skeleton className='h-[348px]' />
      <Skeleton className='h-[348px]' />
      <Skeleton className='h-[348px]' />
    </div>
  );
}
