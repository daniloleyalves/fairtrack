import { DataErrorBoundary } from '@/components/error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import FairteilerHistoryWrapper from '@/features/fairteiler/history/components/history-table-wrapper';
import { Suspense } from 'react';

export default function FairteilerHistoryPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Lebensmittelabgaben-Verlauf
        </h2>
        <p
          className='max-w-5xl text-sm font-medium text-secondary'
          aria-description='form to add access view to fairteiler'
        >
          Verfolge den Verlauf deiner Lebensmittel und nimm nachträglich
          Änderungen vor.
        </p>
      </div>
      <DataErrorBoundary>
        <Suspense fallback={<HistorySkeleton />}>
          <FairteilerHistoryWrapper />
        </Suspense>
      </DataErrorBoundary>
    </div>
  );
}

function HistorySkeleton() {
  const rowCount = 10;
  const colCount = 5;

  return (
    <Card>
      <CardContent>
        <div className='flex items-center pb-4'>
          {/* Input skeleton */}
          <Skeleton className='h-8 w-[250px] bg-secondary' />
        </div>
        <div className='rounded-md border'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                {Array.from({ length: colCount }).map((_, i) => (
                  <th
                    key={i}
                    className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'
                  >
                    {/* Header skeleton */}
                    <Skeleton className='h-5 w-3/4 bg-secondary' />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <tr key={rowIndex} className='border-b transition-colors'>
                  {Array.from({ length: colCount }).map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className='p-4 align-middle [&:has([role=checkbox])]:pr-0'
                    >
                      {/* Cell content skeleton */}
                      <Skeleton className='h-6 w-full bg-secondary' />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination skeleton */}
        <div className='flex items-center justify-end space-x-2 py-4'>
          <Skeleton className='h-8 w-[150px]' />
          <Skeleton className='h-8 w-[70px]' /> {/* "Zurück" button */}
          <Skeleton className='h-8 w-[70px]' /> {/* "Weiter" button */}
        </div>
      </CardContent>
    </Card>
  );
}
