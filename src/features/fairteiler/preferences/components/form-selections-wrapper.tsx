'use client';

import { Suspense } from 'react';
import { preload, SWRConfig } from 'swr';
import { ListErrorBoundary } from '@components/error-boundary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card';
import { Separator } from '@ui/separator';
import { Skeleton } from '@ui/skeleton';
import { Settings } from 'lucide-react';
import { CompanySelectionWrapper } from './company-selection';
import { OriginSelectionWrapper } from './origin-selection';
import { CategorySelectionWrapper } from './category-selection';
import {
  ACTIVE_FAIRTEILER_KEY,
  CATEGORIES_BY_FAIRTEILER_KEY,
  CATEGORY_KEY,
  COMPANIES_BY_FAIRTEILER_KEY,
  COMPANY_KEY,
  ORIGIN_KEY,
  ORIGINS_BY_FAIRTEILER_KEY,
} from '@/lib/config/api-routes';
import { fetcher } from '@/lib/services/swr';

preload(ACTIVE_FAIRTEILER_KEY, fetcher);
preload(ORIGIN_KEY, fetcher);
preload(CATEGORY_KEY, fetcher);
preload(COMPANY_KEY, fetcher);
preload(ORIGINS_BY_FAIRTEILER_KEY, fetcher);
preload(CATEGORIES_BY_FAIRTEILER_KEY, fetcher);
preload(COMPANIES_BY_FAIRTEILER_KEY, fetcher);

export function FormSelectionsWrapper() {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnMount: false,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: true,
      }}
    >
      <Card className='h-max'>
        <CardHeader>
          <div className='flex flex-col gap-3 xs:flex-row'>
            <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Settings className='size-5 text-primary' />
            </div>
            <div>
              <CardTitle>Formular-Einstellungen</CardTitle>
              <CardDescription>
                Verwalte die verfügbaren Optionen für Herkünfte, Kategorien und
                Betriebe im Retteformular
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <ListErrorBoundary>
            <Suspense fallback={<FormSelectionSkeleton />}>
              <OriginSelectionWrapper />
            </Suspense>
          </ListErrorBoundary>
          <Separator />
          <ListErrorBoundary>
            <Suspense fallback={<FormSelectionSkeleton />}>
              <CategorySelectionWrapper />
            </Suspense>
          </ListErrorBoundary>
          <Separator />
          <ListErrorBoundary>
            <Suspense fallback={<FormSelectionSkeleton />}>
              <CompanySelectionWrapper />
            </Suspense>
          </ListErrorBoundary>
        </CardContent>
      </Card>
    </SWRConfig>
  );
}

export function FormSelectionSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='mb-2 h-6 w-32 bg-secondary' />
        <div className='space-y-4'>
          <div>
            <Skeleton className='mb-2 h-4 w-40 bg-secondary' />
            <Skeleton className='mb-3 h-3 w-full bg-secondary' />
            <Skeleton className='h-[70px] w-full bg-secondary' />
          </div>

          <div>
            <Skeleton className='mb-2 h-4 w-40 bg-secondary' />
            <Skeleton className='mb-3 h-3 w-full bg-secondary' />
            <div className='flex h-50 flex-col gap-2'>
              <Skeleton className='h-[50px] w-full bg-secondary' />
              <Skeleton className='h-[50px] w-full bg-secondary' />
              <Skeleton className='h-[50px] w-full bg-secondary' />
            </div>
          </div>

          <div>
            <Skeleton className='mb-2 h-4 w-40 bg-secondary' />
            <Skeleton className='mb-3 h-3 w-full bg-secondary' />
            <Skeleton className='h-[32px] w-full bg-secondary' />
          </div>
        </div>
      </div>
    </div>
  );
}
