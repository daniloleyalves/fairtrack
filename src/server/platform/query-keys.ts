import { STALE } from '../_lib/stale-times';

export const platformKeys = {
  all: () => ({ queryKey: ['platform'] as const, staleTime: STALE.DASHBOARD }),
  stats: () => ({
    queryKey: ['platform', 'stats'] as const,
    staleTime: STALE.DASHBOARD,
  }),
};
