'use client';

import { BlurFade } from '@components/magicui/blur-fade';
import { Card, CardContent } from '@/components/ui/card';
import { UserHistoryTable } from './user-history-table';
import { Button } from '@/components/ui/button';
import { useUserHistoryData } from '../use-user-history-data';

export function UserHistoryWrapper() {
  const {
    contributions,
    isEmpty,
    totalCount,
    loadedCount,
    loadAll,
    hasLoadedAll,
    isLoadingAll,
  } = useUserHistoryData();

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
          <UserHistoryTable
            data={contributions}
            loadingControls={loadingControls}
          />
        </CardContent>
      </Card>
    </BlurFade>
  );
}
