'use client';

import { useQuery } from '@tanstack/react-query';
import { getFairteilerDashboardData } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { FairteilerDashboard } from './fairteiler-dashboard';
import { FairteilerDashboardGridSkeleton } from './fairteiler-dashboard-grid-skeleton';

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
