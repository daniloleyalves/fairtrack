import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

export function UserHistoryTableSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className='mb-4 flex flex-1 flex-col flex-wrap gap-2 md:flex-row md:items-center md:gap-4'>
          <Skeleton variant='onCard' className='h-9 w-[250px]' />
          <div className='flex flex-wrap gap-2'>
            <Skeleton variant='onCard' className='h-9 w-[120px]' />
            <Skeleton variant='onCard' className='h-9 w-[100px]' />
            <Skeleton variant='onCard' className='h-9 w-[110px]' />
            <Skeleton variant='onCard' className='h-9 w-[90px]' />
          </div>
        </div>

        <TableSkeleton rows={8} columns={6} showPagination />
      </CardContent>
    </Card>
  );
}
