'use client';

import { Button } from '@/components/ui/button';
import { useHistoryData } from '../use-history-pagination';
import { HistoryTable } from './history-table';

export function HistoryTablePaginated() {
  const {
    contributions,
    isEmpty,
    totalCount,
    loadedCount,
    loadAll,
    hasLoadedAll,
    isLoadingAll,
  } = useHistoryData();

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
    <div className='w-full'>
      <HistoryTable data={contributions} loadingControls={loadingControls} />
    </div>
  );
}
