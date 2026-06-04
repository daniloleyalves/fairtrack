import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

export default function UserHistoryLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-6'>
        <Skeleton variant='onCard' className='mb-2 h-8 w-48 rounded-md' />
        <Skeleton variant='onCard' className='h-5 w-80 rounded-md' />
      </div>

      <Card>
        <CardContent className='p-6'>
          <div className='mb-4 flex flex-1 flex-col flex-wrap gap-2 md:flex-row md:items-center md:gap-4'>
            <Skeleton variant='onCard' className='h-10 w-[250px]' />
            <Skeleton variant='onCard' className='h-10 w-[200px]' />
            <div className='flex flex-wrap gap-2'>
              <Skeleton variant='onCard' className='h-10 w-[120px]' />
              <Skeleton variant='onCard' className='h-10 w-[100px]' />
              <Skeleton variant='onCard' className='h-10 w-[110px]' />
              <Skeleton variant='onCard' className='h-10 w-[90px]' />
            </div>
          </div>

          <TableSkeleton rows={8} columns={6} showPagination />
        </CardContent>
      </Card>
    </div>
  );
}
