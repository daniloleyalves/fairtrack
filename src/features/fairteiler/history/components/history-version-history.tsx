'use client';

import { FAIRTEILER_CONTRIBUTION_VERSION_HISTORY } from '@/lib/config/api-routes';
import useSWRSuspense from '@/lib/services/swr';
import { ContributionVersionHistory } from '@/server/db/db-types';
import { formatInTimeZone } from 'date-fns-tz';

interface VersionHistoryProps {
  checkinId: string;
}

export function HistoryVersionHistory({ checkinId }: VersionHistoryProps) {
  const { data, error } = useSWRSuspense<ContributionVersionHistory[]>(
    `${FAIRTEILER_CONTRIBUTION_VERSION_HISTORY}?checkinId=${checkinId}`,
    {
      revalidateIfStale: true,
      revalidateOnMount: true,
    },
  );

  return (
    <div className='relative max-h-72 space-y-2 overflow-y-auto pr-2'>
      {!error ? (
        data?.length ? (
          data.map((v, index) => (
            <div key={v.id} className='relative pl-6 text-sm'>
              {index < data.length - 1 && (
                <div className='absolute top-1 left-[7px] h-full w-px bg-border' />
              )}
              <div className='background absolute top-1 left-1 size-2 rounded-full bg-primary' />
              <p>
                <strong className='capitalize'>
                  {/* derzeit ist es nur möglich die Menge nachträglich zu ändern -> fixer Titel */}
                  {/* {v.field} */}
                  Menge
                </strong>{' '}
                von {v.prevValue} auf {v.newValue} geändert.
              </p>
              <p className='pb-2 text-xs text-muted-foreground'>
                {`${v.authorName} am
                          ${formatInTimeZone(
                            v.changeDate,
                            'UTC',
                            'dd.MM.yyyy',
                          )}`}
              </p>
            </div>
          ))
        ) : (
          <p className='text-center'>Es wurden keine Änderungen vorgenommen</p>
        )
      ) : (
        <p>
          Beim laden des Versionsverlaufs ist ein unerwarteter Fehler
          unterlaufen
        </p>
      )}
    </div>
  );
}
