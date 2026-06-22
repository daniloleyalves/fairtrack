import { STALE } from '../_lib/stale-times';
import { getPlatformStats } from './queries';

export const platformKeys = {
  all: () => ({
    queryKey: ['platform'] as const,
    staleTime: STALE.DASHBOARD,
  }),
  stats: () => ({
    queryKey: ['platform', 'stats'] as const,
    queryFn: getPlatformStats,
    staleTime: STALE.DASHBOARD,
  }),
};
