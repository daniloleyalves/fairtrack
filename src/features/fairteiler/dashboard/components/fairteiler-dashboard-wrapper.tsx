'use client';

import { preload } from 'swr';
import {
  CATEGORIES_BY_FAIRTEILER_KEY,
  COMPANIES_BY_FAIRTEILER_KEY,
  FAIRTEILER_DASHBOARD_KEY,
  ORIGINS_BY_FAIRTEILER_KEY,
} from '@/lib/config/api-routes';
import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { FairteilerDashboard } from './fairteiler-dashboard';

preload(ORIGINS_BY_FAIRTEILER_KEY, fetcher);
preload(CATEGORIES_BY_FAIRTEILER_KEY, fetcher);
preload(COMPANIES_BY_FAIRTEILER_KEY, fetcher);

// --- Type Definition for our API data ---
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
    email: string;
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
  const { data } = useSWRSuspense<DashboardData>(FAIRTEILER_DASHBOARD_KEY, {
    fetcher,
    revalidateIfStale: true,
    revalidateOnMount: true,
  });

  return <FairteilerDashboard data={data} />;
}
