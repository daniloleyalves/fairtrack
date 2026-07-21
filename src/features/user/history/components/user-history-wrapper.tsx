'use client';

import { Card, CardContent } from '@/components/ui/card';
import { UserHistoryTable } from './user-history-table';
import { Button } from '@/components/ui/button';
import { useUserHistoryData } from '../use-user-history-data';
import { UserHistoryTableSkeleton } from './user-history-table-skeleton';

export function UserHistoryWrapper() {
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
  } = useUserHistoryData();

  if (isPending) {
    return <UserHistoryTableSkeleton />;
  }

  if (error) {
    throw error;
  }

  if (isEmpty) {
    return (
      <Card className='py-8 text-center'>
        <p className='text-muted-foreground'>Keine Einträge gefunden</p>
      </Card>
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
    <div>
      <Card>
        <CardContent>
          <UserHistoryTable
            data={contributions}
            loadingControls={loadingControls}
          />
        </CardContent>
      </Card>
    </div>
  );
}
