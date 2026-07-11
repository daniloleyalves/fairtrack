import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { cn } from '@/lib/utils';

export function FairteilerTagsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex gap-2'>
          <Skeleton className='h-[22px] w-16 bg-secondary' />
          <Skeleton className='h-[22px] w-12 bg-secondary' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-[14px] w-24 bg-secondary' />
          <Skeleton className='h-9 w-full bg-secondary' />
        </div>
      </CardContent>
    </Card>
  );
}
