import { FormSelectionsWrapper } from '@/features/fairteiler/preferences/components/form-selections-wrapper';
import { ListErrorBoundary } from '@/components/error-boundary';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FairteilerDisableWrapper } from '@/features/fairteiler/preferences/components/fairteiler-disable-wrapper';
import { FairteilerTutorialCardWrapper } from '@/features/fairteiler/tutorial/components/fairteiler-tutorial-card-wrapper';
import { BookOpen, UserIcon } from 'lucide-react';

export default function FairteilerPreferencesPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Präferenzen
        </h2>
        <p
          className='max-w-5xl text-sm font-medium text-secondary'
          aria-description='fairteiler preferences and settings'
        >
          Verwalte die Einstellungen deines Fairteilers. Du kannst die
          Sichtbarkeit steuern und die verfügbaren Optionen für Herkünfte,
          Kategorien und Betriebe im Retteformular anpassen. Neue Einträge
          können bei Bedarf vorgeschlagen und ergänzt werden.
        </p>
      </div>
      <ListErrorBoundary>
        <Suspense fallback={<FairteilerDisableSkeleton />}>
          <FairteilerDisableWrapper />
        </Suspense>
      </ListErrorBoundary>
      <ListErrorBoundary>
        <Suspense fallback={<TutorialCardSkeleton />}>
          <FairteilerTutorialCardWrapper />
        </Suspense>
      </ListErrorBoundary>
      <FormSelectionsWrapper />
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

function FairteilerDisableSkeleton() {
  return (
    <Card className='h-max'>
      <CardHeader className='flex justify-between'>
        <div className='flex flex-col gap-3 xs:flex-row'>
          <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
            <UserIcon className='size-5 text-primary' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-48 bg-secondary' />
            <div className='space-y-1'>
              <Skeleton className='h-2 w-56 bg-secondary' />
            </div>
          </div>
        </div>
        <Skeleton className='h-5 w-10 bg-secondary' />
      </CardHeader>
    </Card>
  );
}
