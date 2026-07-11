'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';
import { UserHistoryTable } from './user-history-table';
import { Button } from '@/components/ui/button';
import { useUserHistoryData } from '../use-user-history-data';

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
    return <UserHistorySkeleton />;
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

function UserHistorySkeleton() {
  return (
    <Card>
      <CardContent>
        <div className='mb-4 flex flex-1 flex-col flex-wrap gap-2 md:flex-row md:items-center md:gap-4'>
          <Skeleton variant='onCard' className='h-9 w-[250px]' />
          <Skeleton variant='onCard' className='h-9 w-[200px]' />
          <div className='flex flex-wrap gap-2'>
            <Skeleton variant='onCard' className='h-9 w-[120px]' />
            <Skeleton variant='onCard' className='h-9 w-[100px]' />
            <Skeleton variant='onCard' className='h-9 w-[110px]' />
            <Skeleton variant='onCard' className='h-9 w-[90px]' />
          </div>
        </div>

        <TableSkeleton rows={8} columns={6} showPagination />
      </CardContent>
    </Card>
  );
}
