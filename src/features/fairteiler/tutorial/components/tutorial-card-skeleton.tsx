import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

export function TutorialCardSkeleton() {
  return (
    <Card className='h-max'>
      <CardHeader>
        <div className='flex flex-col gap-3 xs:flex-row'>
          <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
            <BookOpen className='size-5 text-primary' />
          </div>
          <div>
            <Skeleton className='mb-2 h-6 w-48 bg-secondary' />
            <Skeleton className='h-3 w-full bg-secondary' />
            <Skeleton className='mt-1 h-3 w-full bg-secondary' />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-32 bg-secondary' />
              <Skeleton className='h-3 w-24 bg-secondary' />
              <Skeleton className='h-3 w-40 bg-secondary' />
            </div>
            <div className='flex gap-2'>
              <Skeleton className='h-8 w-8 bg-secondary' />
              <Skeleton className='h-8 w-8 bg-secondary' />
              <Skeleton className='h-8 w-8 bg-secondary' />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
