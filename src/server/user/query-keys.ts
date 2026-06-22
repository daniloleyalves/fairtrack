import { STALE } from '../_lib/stale-times';
import {
  getMilestoneData,
  getUserContributions,
  getUserDashboardData,
  getUserPreferences,
  getUserProfile,
} from './queries';

export const userKeys = {
  all: () => ({
    queryKey: ['user'] as const,
    staleTime: STALE.PROFILE,
  }),
  session: () => ({
    queryKey: ['user', 'session'] as const,
    staleTime: STALE.ACTIVE_SESSION,
    refetchOnMount: 'always' as const,
  }),
  profile: () => ({
    queryKey: ['user', 'profile'] as const,
    queryFn: getUserProfile,
    staleTime: STALE.PROFILE,
  }),
  dashboard: () => ({
    queryKey: ['user', 'dashboard'] as const,
    queryFn: getUserDashboardData,
    staleTime: STALE.DASHBOARD,
  }),
  preferences: () => ({
    queryKey: ['user', 'preferences'] as const,
    queryFn: getUserPreferences,
    staleTime: STALE.PROFILE,
  }),
  onboarding: () => ({
    queryKey: ['user', 'onboarding'] as const,
    staleTime: STALE.ACTIVE_SESSION,
    refetchOnMount: 'always' as const,
  }),
  streak: () => ({
    queryKey: ['user', 'streak'] as const,
    staleTime: STALE.DASHBOARD,
  }),
  milestones: () => ({
    queryKey: ['user', 'milestones'] as const,
    queryFn: getMilestoneData,
    staleTime: STALE.DASHBOARD,
  }),
  contributions: (params?: {
    dateRange?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  }) => ({
    queryKey: ['user', 'contributions', params ?? {}] as const,
    queryFn: () => getUserContributions(params),
    staleTime: STALE.DASHBOARD,
  }),
  latestContributions: (limit?: number) => ({
    queryKey: ['user', 'contributions', 'latest', limit] as const,
    staleTime: STALE.LIVE,
  }),
};
