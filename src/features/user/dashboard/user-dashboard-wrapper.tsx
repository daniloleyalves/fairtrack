'use client';

import { USER_DASHBOARD_KEY } from '@/lib/config/api-routes';
import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { UserDashboard } from './user-dashboard';
import { MilestoneData } from '../gamification/milestones/milestone-processor';

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
  const { data: dashboardData } = useSWRSuspense<UserDashboardData>(
    USER_DASHBOARD_KEY,
    {
      fetcher,
      revalidateIfStale: true,
      revalidateOnMount: true,
    },
  );

  return <UserDashboard dashboardData={dashboardData} />;
}
