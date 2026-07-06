import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

export default function FairteilerHistoryLoading() {
  return (
    <Card>
      <CardContent>
        <div className='flex items-center pb-4'>
          <Skeleton variant='onCard' className='h-8 w-[250px]' />
        </div>
        <TableSkeleton rows={8} columns={5} showPagination />
      </CardContent>
    </Card>
  );
}
