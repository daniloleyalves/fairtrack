'use client';

import { BlurFade } from '@components/magicui/blur-fade';
import { Card, CardContent } from '@/components/ui/card';
import { HistoryTable } from './history-table';
import { Button } from '@/components/ui/button';
import { useHistoryData } from '../use-history-data';

export function FairteilerHistoryWrapper() {
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
