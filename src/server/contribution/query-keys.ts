import { STALE } from '../_lib/stale-times';
import {
  getContributions,
  getKeyFigures,
  getVersionHistoryByCheckinId,
} from './queries';

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
    queryFn: () => getContributions(params),
    staleTime: STALE.DASHBOARD,
  }),
  versionHistory: (checkinId: string) => ({
    queryKey: ['contributions', 'version-history', checkinId] as const,
    queryFn: () => getVersionHistoryByCheckinId(checkinId),
    staleTime: STALE.DASHBOARD,
  }),
  recentCheckins: () => ({
    queryKey: ['contributions', 'recent-checkins'] as const,
    staleTime: STALE.LIVE,
  }),
  keyFigures: () => ({
    queryKey: ['contributions', 'key-figures'] as const,
    queryFn: getKeyFigures,
    staleTime: STALE.DASHBOARD,
  }),
};
