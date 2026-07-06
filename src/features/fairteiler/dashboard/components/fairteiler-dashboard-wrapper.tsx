'use client';

import { useQuery } from '@tanstack/react-query';
import { preload } from 'swr';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CATEGORIES_BY_FAIRTEILER_KEY,
  COMPANIES_BY_FAIRTEILER_KEY,
  ORIGINS_BY_FAIRTEILER_KEY,
} from '@/lib/config/api-routes';
import { fetcher } from '@/lib/services/swr';
import { getFairteilerDashboardData } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { FairteilerDashboard } from './fairteiler-dashboard';

// Catalog preloads stay on SWR until Phase 5 (downstream mutation forms
// still consume these keys).
preload(ORIGINS_BY_FAIRTEILER_KEY, fetcher);
preload(CATEGORIES_BY_FAIRTEILER_KEY, fetcher);
preload(COMPANIES_BY_FAIRTEILER_KEY, fetcher);

export interface DashboardData {
  keyFigures: {
    value: number;
    description: string;
    color?: 'primary' | 'default' | 'destructive';
    unit?: string;
  }[];
  categoryDistribution: {
    name: string;
    data: { position: number; value: number; description: string }[];
  };
  originDistribution: {
    name: string;
    data: { position: number; value: number; description: string }[];
  };
  leaderboardEntries: {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
    totalQuantity: number;
  }[];
  recentContributions: {
    id: string;
    date: Date;
    title: string | null;
    quantity: number;
    category: { name: string; image: string | null };
  }[];
  calendarData: {
    value: string;
    quantity: number;
  }[];
}

export default function FairteilerDashboardWrapper() {
  const { data, isPending, error } = useQuery({
    ...fairteilerKeys.dashboard(),
    queryFn: () => getFairteilerDashboardData(),
  });

  if (isPending) {
    return <FairteilerDashboardGridSkeleton />;
  }

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Dashboard-Daten nicht gefunden.');
  }

  return <FairteilerDashboard data={data} />;
}

function FairteilerDashboardGridSkeleton() {
  return (
    <div className='grid grid-cols-12 gap-4'>
      {/* Left Column Content */}
      <div className='col-span-12 flex flex-col gap-4 lg:col-span-7'>
        <div className='flex gap-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className='flex h-32 w-full flex-col items-center justify-center p-4'
            >
              <Skeleton className='size-12 rounded-full bg-secondary' />
              <Skeleton className='h-4 w-1/3 rounded-md bg-secondary' />
            </Card>
          ))}
        </div>

        <Card className='flex flex-col gap-4 rounded-lg p-4'>
          <div className='flex-1 space-y-4'>
            <Skeleton className='h-6 w-3/4 rounded-md bg-secondary' />
            <Skeleton className='h-28 w-full rounded-md bg-secondary' />
          </div>
          <div className='h-full w-px bg-border md:hidden' />
          <div className='flex-1 space-y-4'>
            <Skeleton className='h-6 w-3/4 rounded-md bg-secondary' />
            <Skeleton className='h-28 w-full rounded-md bg-secondary' />
          </div>
        </Card>
      </div>

      {/* Right Column (Leaderboard) */}
      <div className='relative col-span-12 lg:col-span-5'>
        <Card className='h-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton className='h-8 w-1/2 rounded-md bg-secondary' />
          <div className='space-y-3'>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='size-8 rounded-full bg-secondary' />
                <Skeleton className='h-4 w-24 rounded-md bg-secondary' />
                <Skeleton className='ml-auto h-4 w-16 rounded-md bg-secondary' />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className='col-span-12 flex flex-col-reverse gap-4 lg:flex-row'>
        <Card className='h-max flex-col gap-4 rounded-lg p-4 not-even:w-full'>
          <Skeleton className='h-8 w-1/2 rounded-md bg-secondary' />
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='size-8 rounded-md bg-secondary' />
                <Skeleton className='h-4 w-3/4 rounded-md bg-secondary' />
                <Skeleton className='ml-auto h-4 w-12 rounded-md bg-secondary' />
              </div>
            ))}
          </div>
        </Card>

        <Card className='w-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton className='h-8 w-1/3 rounded-md bg-secondary' />
          <div className='grid h-full grid-cols-7 grid-rows-4 gap-1'>
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className='aspect-square bg-secondary' />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
