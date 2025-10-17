import { GAMIFICATION_MILESTONE_PRGRESS } from '@/lib/config/api-routes';
import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { Milestone, MilestoneEvent } from '@/server/db/db-types';
import { transformMilestoneData } from './milestone-utils';

export interface MilestoneDisplay {
  id: string;
  quantity: number;
  isAchieved: boolean;
  achievedAt?: Date;
}

export interface MilestoneData {
  achieved: MilestoneDisplay[];
  nextMilestone: MilestoneDisplay | null;
}

/**
 * Custom hook to load and transform milestone data for display
 */
export const getMilestoneProgress = () => {
  // Fetch all milestones (these rarely change, so we can use a longer revalidation time)
  const { data: milestoneData, error: _milestonesError } = useSWRSuspense<{
    milestones: Milestone[];
    milestoneEvents: MilestoneEvent[];
  }>(GAMIFICATION_MILESTONE_PRGRESS, {
    fetcher,
    revalidateIfStale: false,
    revalidateOnMount: false,
    revalidateOnReconnect: true,
  });

  // TODO HANDLE ERROR

  // Transform data for display
  const milestoneProgress = transformMilestoneData(milestoneData);
  return milestoneProgress;
};
