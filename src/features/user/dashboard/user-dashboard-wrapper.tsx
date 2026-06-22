'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { ListSkeleton, Skeleton } from '@/components/ui/skeleton';
import { userKeys } from '@/server/user/query-keys';
import { UserDashboard } from './user-dashboard';
import { MilestoneData } from '../gamification/milestones/milestone-utils';

export interface UserDashboardData {
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
  milestoneData: MilestoneData | null;
}

export default function UserDashboardWrapper() {
  const { data: dashboardData, isPending } = useQuery(userKeys.dashboard());

  if (isPending || !dashboardData) {
    return <UserDashboardGridSkeleton />;
  }

  return <UserDashboard dashboardData={dashboardData} />;
}

function UserDashboardGridSkeleton() {
  return (
    <div className='grid grid-cols-12 gap-4'>
      {/* Main Statistics */}
      <div className='md:col-span1 order-1 col-span-12 flex flex-col gap-2 md:flex-row lg:col-span-4 lg:flex-col'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className='flex h-32 w-full flex-col items-center justify-center p-4'
          >
            <Skeleton variant='onCard' className='size-12 rounded-full' />
            <Skeleton variant='onCard' className='mt-1 h-6 w-3/4 rounded-md' />
          </Card>
        ))}
      </div>

      {/* Milestones */}
      <div className='order-2 col-span-12 md:order-3 md:col-span-2 lg:col-span-1'>
        <Card className='h-full p-4'>
          <Skeleton variant='onCard' className='h-6 rounded-md' />
          <div className='mt-4 space-y-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex flex-col items-center gap-2'>
                <Skeleton variant='onCard' className='size-8 rounded-full' />
                <Skeleton variant='onCard' className='h-4 w-full rounded-md' />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className='order-3 col-span-12 w-full md:order-2 md:col-span-10 lg:col-span-7'>
        <Card className='h-full flex-col justify-between gap-4 rounded-lg bg-white p-4 md:gap-0 md:py-2'>
          <Skeleton
            variant='onCard'
            className='my-auto h-36 w-full rounded-md'
          />
          <div className='hidden h-px w-full bg-border md:block' />
          <div className='h-full w-px bg-border md:hidden' />
          <Skeleton
            variant='onCard'
            className='my-auto h-36 w-full rounded-md'
          />
        </Card>
      </div>

      {/* Bottom Row Content */}
      <div className='order-4 col-span-12 flex flex-col-reverse gap-4 md:col-span-10 lg:col-span-11 lg:flex-row'>
        {/* Recent Contributions */}
        <Card className='w-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton variant='onCard' className='h-6 w-1/3 rounded-md' />
          <ListSkeleton rows={5} showAvatar showTrailing />
        </Card>

        {/* Data Calendar */}
        <Card className='w-full flex-col gap-4 rounded-lg p-4'>
          <Skeleton variant='onCard' className='h-6 w-1/3 rounded-md' />
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
