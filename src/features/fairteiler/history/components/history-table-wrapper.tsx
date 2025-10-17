'use client';

import { BlurFade } from '@components/magicui/blur-fade';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetcher } from '@/lib/services/swr';
import { SWRConfig } from 'swr';
import { Suspense } from 'react';
import { HistoryTablePaginated } from './history-table-paginated';

function HistoryTableSkeleton() {
  const rowCount = 10;
  const colCount = 5;

  return (
    <div className='space-y-4'>
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
    </div>
  );
}

export default function FairteilerHistoryWrapper() {
  return (
    <SWRConfig
      value={{
        fetcher,
        suspense: true,
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateIfStale: false,
        revalidateOnReconnect: true,
      }}
    >
      <BlurFade duration={0.2}>
        <Card>
          <CardContent>
            <Suspense fallback={<HistoryTableSkeleton />}>
              <HistoryTablePaginated />
            </Suspense>
          </CardContent>
        </Card>
      </BlurFade>
    </SWRConfig>
  );
}
