'use client';

import { BlurFade } from '@components/magicui/blur-fade';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HistoryTable } from './history-table';
import { Button } from '@/components/ui/button';
import { useHistoryData } from '../use-history-data';

export function FairteilerHistoryWrapper() {
  const {
    isPending,
    error,
    contributions,
    isEmpty,
    totalCount,
    loadedCount,
    loadAll,
    hasLoadedAll,
    isLoadingAll,
  } = useHistoryData();

  if (isPending) {
    return <HistorySkeleton />;
  }

  if (error) {
    throw error;
  }

  if (isEmpty) {
    return (
      <div className='py-8 text-center'>
        <p className='text-muted-foreground'>Keine Einträge gefunden</p>
      </div>
    );
  }

  const loadingControls = (
    <div className='flex flex-col items-center gap-2 sm:flex-row'>
      {!hasLoadedAll && (
        <>
          <Button
            onClick={loadAll}
            disabled={isLoadingAll}
            variant='outline'
            size='sm'
          >
            {isLoadingAll ? 'Lädt...' : 'Alle laden'}
          </Button>
          <div className='ml-4 text-sm text-muted-foreground'>
            {loadedCount} von {totalCount} Einträgen geladen
          </div>
        </>
      )}
      {hasLoadedAll && (
        <span className='text-sm text-muted-foreground'>
          Alle Daten geladen
        </span>
      )}
    </div>
  );
  return (
    <BlurFade duration={0.2}>
      <Card>
        <CardContent>
          <HistoryTable
            data={contributions}
            loadingControls={loadingControls}
          />
        </CardContent>
      </Card>
    </BlurFade>
  );
}

function HistorySkeleton() {
  const rowCount = 10;
  const colCount = 5;

  return (
    <Card>
      <CardContent>
        <div className='flex items-center pb-4'>
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
                      <Skeleton className='h-6 w-full bg-secondary' />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <Skeleton className='h-8 w-[150px]' />
          <Skeleton className='h-8 w-[70px]' />
          <Skeleton className='h-8 w-[70px]' />
        </div>
      </CardContent>
    </Card>
  );
}
