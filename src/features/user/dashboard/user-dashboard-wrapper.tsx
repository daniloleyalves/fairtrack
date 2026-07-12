'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserDashboardData } from '@/server/user/queries';
import { userKeys } from '@/server/user/query-keys';
import { UserDashboard } from './user-dashboard';
import { UserDashboardGridSkeleton } from './user-dashboard-grid-skeleton';
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
  const {
    data: dashboardData,
    isPending,
    error,
  } = useQuery({
    ...userKeys.dashboard(),
    queryFn: () => getUserDashboardData(),
  });

  if (isPending) {
    return <UserDashboardGridSkeleton />;
  }

  if (error) {
    throw error;
  }

  if (!dashboardData) {
    throw new Error('Dashboard-Daten nicht gefunden.');
  }

  return <UserDashboard dashboardData={dashboardData} />;
}
