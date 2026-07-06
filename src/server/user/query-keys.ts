import { STALE } from '../_lib/stale-times';

export const userKeys = {
  all: () => ({ queryKey: ['user'] as const, staleTime: STALE.PROFILE }),
  session: () => ({
    queryKey: ['user', 'session'] as const,
    staleTime: STALE.ACTIVE_SESSION,
  }),
  profile: () => ({
    queryKey: ['user', 'profile'] as const,
    staleTime: STALE.PROFILE,
  }),
  dashboard: () => ({
    queryKey: ['user', 'dashboard'] as const,
    staleTime: STALE.DASHBOARD,
  }),
  preferences: () => ({
    queryKey: ['user', 'preferences'] as const,
    staleTime: STALE.PROFILE,
  }),
  onboarding: () => ({
    queryKey: ['user', 'onboarding'] as const,
    staleTime: STALE.ACTIVE_SESSION,
  }),
  streak: () => ({
    queryKey: ['user', 'streak'] as const,
    staleTime: STALE.DASHBOARD,
  }),
  milestones: () => ({
    queryKey: ['user', 'milestones'] as const,
    staleTime: STALE.DASHBOARD,
  }),
  contributions: (params?: {
    dateRange?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  }) => ({
    queryKey: ['user', 'contributions', params ?? {}] as const,
    staleTime: STALE.DASHBOARD,
  }),
  latestContributions: (limit?: number) => ({
    queryKey: ['user', 'contributions', 'latest', limit] as const,
    staleTime: STALE.LIVE,
  }),
};
