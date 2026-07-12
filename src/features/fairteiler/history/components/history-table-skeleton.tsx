import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

export function FairteilerHistorySkeleton() {
  return (
    <Card>
      <CardContent>
        <div className='flex flex-wrap items-center gap-2 pb-4 md:gap-4'>
          <Skeleton variant='onCard' className='h-9 w-[390px] max-w-full' />
          <Skeleton variant='onCard' className='h-9 w-[172px]' />
          <div className='flex gap-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant='onCard' className='h-9 w-[105px]' />
            ))}
          </div>
        </div>
        <TableSkeleton rows={10} columns={5} showPagination />
      </CardContent>
    </Card>
  );
}
