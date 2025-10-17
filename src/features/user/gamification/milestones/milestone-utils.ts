import { Milestone, MilestoneEvent } from '@/server/db/db-types';
import { MilestoneData, MilestoneDisplay } from './milestone-processor';

/**
 * Transform raw data into display format
 */
export function transformMilestoneData({
  milestones,
  milestoneEvents,
}: {
  milestones: Milestone[] | null;
  milestoneEvents: MilestoneEvent[] | null;
}): MilestoneData | null {
  if (!milestones || !milestoneEvents) {
    return null;
  }

  // Create achievement lookup map
  const achievedMap = new Map(
    milestoneEvents.map((event) => [event.milestoneId, event.createdAt]),
  );

  // Process all milestones
  const processedMilestones: MilestoneDisplay[] = milestones
    .map((milestone) => {
      const isAchieved = achievedMap.has(milestone.id);
      return {
        id: milestone.id,
        quantity: milestone.quantity,
        isAchieved,
        achievedAt: achievedMap.get(milestone.id),
      };
    })
    .sort((a, b) => a.quantity - b.quantity);

  // Split into achieved and next
  const achieved = processedMilestones.filter((m) => m.isAchieved);
  const nextMilestone = processedMilestones.find((m) => !m.isAchieved) ?? null;

  return {
    achieved,
    nextMilestone,
  };
}
