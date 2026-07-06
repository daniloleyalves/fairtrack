import { STALE } from '../_lib/stale-times';

export const contributionKeys = {
  all: () => ({
    queryKey: ['contributions'] as const,
    staleTime: STALE.DASHBOARD,
  }),
  list: (params?: {
    platformWide?: boolean;
    dateRange?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  }) => ({
    queryKey: ['contributions', 'list', params ?? {}] as const,
    staleTime: STALE.DASHBOARD,
  }),
  versionHistory: (checkinId: string) => ({
    queryKey: ['contributions', 'version-history', checkinId] as const,
    staleTime: STALE.DASHBOARD,
  }),
  recentCheckins: () => ({
    queryKey: ['contributions', 'recent-checkins'] as const,
    staleTime: STALE.LIVE,
  }),
  keyFigures: () => ({
    queryKey: ['contributions', 'key-figures'] as const,
    staleTime: STALE.DASHBOARD,
  }),
};
