'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { getVersionHistoryByCheckinId } from '@/server/contribution/queries';
import { contributionKeys } from '@/server/contribution/query-keys';

interface VersionHistoryProps {
  checkinId: string;
}

export function HistoryVersionHistory({ checkinId }: VersionHistoryProps) {
  const { data, isPending, error } = useQuery({
    ...contributionKeys.versionHistory(checkinId),
    queryFn: () => getVersionHistoryByCheckinId(checkinId),
  });

  if (isPending) {
    return <Loader2 className='mx-auto animate-spin' />;
  }

  if (error) {
    return (
      <p>
        Beim laden des Versionsverlaufs ist ein unerwarteter Fehler unterlaufen
      </p>
    );
  }

  if (!data.length) {
    return (
      <p className='text-center'>Es wurden keine Änderungen vorgenommen</p>
    );
  }

  return (
    <div className='relative max-h-72 space-y-2 overflow-y-auto pr-2'>
      {data.map((v, index) => (
        <div key={v.id} className='relative pl-6 text-sm'>
          {index < data.length - 1 && (
            <div className='absolute top-1 left-[7px] h-full w-px bg-border' />
          )}
          <div className='background absolute top-1 left-1 size-2 rounded-full bg-primary' />
          <p>
            <strong className='capitalize'>Menge</strong> von {v.prevValue} auf{' '}
            {v.newValue} geändert.
          </p>
          <p className='pb-2 text-xs text-muted-foreground'>
            {`${v.authorName} am ${formatInTimeZone(
              v.changeDate,
              'UTC',
              'dd.MM.yyyy',
            )}`}
          </p>
        </div>
      ))}
    </div>
  );
}
