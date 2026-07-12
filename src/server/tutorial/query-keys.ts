import { STALE } from '../_lib/stale-times';

export const tutorialKeys = {
  all: () => ({ queryKey: ['tutorial'] as const, staleTime: STALE.PROFILE }),
  fairteilerTutorial: () => ({
    queryKey: ['tutorial', 'fairteiler'] as const,
    staleTime: STALE.PROFILE,
  }),
  contributionProgress: (fairteilerId: string) => ({
    queryKey: ['tutorial', 'contribution-progress', fairteilerId] as const,
    staleTime: STALE.ACTIVE_SESSION,
  }),
};
