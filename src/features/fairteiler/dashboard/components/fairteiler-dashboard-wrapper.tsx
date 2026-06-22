'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { ListSkeleton, Skeleton } from '@/components/ui/skeleton';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { FairteilerDashboard } from './fairteiler-dashboard';

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
  const { data, isPending } = useQuery(fairteilerKeys.dashboard());

  if (isPending || !data) {
    return <FairteilerDashboardGridSkeleton />;
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
              <Skeleton variant='onCard' className='size-12 rounded-full' />
              <Skeleton variant='onCard' className='h-4 w-1/3 rounded-md' />
            </Card>
          ))}
        </div>

        <Card className='flex flex-col gap-4 rounded-lg p-4'>
          <div className='flex-1 space-y-4'>
            <Skeleton variant='onCard' className='h-6 w-3/4 rounded-md' />
            <Skeleton variant='onCard' className='h-28 w-full rounded-md' />
          </div>
          <div className='h-full w-px bg-border md:hidden' />
          <div className='flex-1 space-y-4'>
            <Skeleton variant='onCard' className='h-6 w-3/4 rounded-md' />
            <Skeleton variant='onCard' className='h-28 w-full rounded-md' />
          </div>
        </Card>
      </div>

      {/* Right Column (Leaderboard) */}
      <div className='relative col-span-12 lg:col-span-5'>
        <Card className='h-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton variant='onCard' className='h-8 w-1/2 rounded-md' />
          <ListSkeleton rows={9} showAvatar showTrailing />
        </Card>
      </div>

      {/* Bottom Row */}
      <div className='col-span-12 flex flex-col-reverse gap-4 lg:flex-row'>
        <Card className='h-max flex-col gap-4 rounded-lg p-4 not-even:w-full'>
          <Skeleton variant='onCard' className='h-8 w-1/2 rounded-md' />
          <ListSkeleton rows={5} showAvatar showTrailing />
        </Card>

        <Card className='w-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton variant='onCard' className='h-8 w-1/3 rounded-md' />
          <div className='grid h-full grid-cols-7 grid-rows-4 gap-1'>
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} variant='onCard' className='aspect-square' />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
