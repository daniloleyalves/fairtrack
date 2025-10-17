import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { FairteilerTutorialCardWrapper } from '@/features/fairteiler/tutorial/components/fairteiler-tutorial-card-wrapper';
import { ListErrorBoundary } from '@/components/error-boundary';

export default function FairteilerTutorialPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Tutorial Verwaltung
        </h2>
        <p className='max-w-5xl text-sm font-medium text-secondary'>
          Erstelle und verwalte eine personalisierte Schritt-für-Schritt
          Anleitung für deine Fairteiler-Benutzer. Das Tutorial wird vor dem
          Retteformular angezeigt und kann übersprungen werden.
        </p>
      </div>

      <ListErrorBoundary>
        <Suspense fallback={<TutorialCardSkeleton />}>
          <FairteilerTutorialCardWrapper />
        </Suspense>
      </ListErrorBoundary>
    </div>
  );
}

function TutorialCardSkeleton() {
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
