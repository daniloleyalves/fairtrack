import { db } from '@/server/db/drizzle';
import { stepFlowProgress } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { PersistedStepFlow } from '@/lib/factories/step-flow-factory';

export interface ContributionTutorialStepData {
  completed?: boolean;
  skipped?: boolean;
}

export async function saveTutorialProgress(
  data: PersistedStepFlow<ContributionTutorialStepData>,
): Promise<void> {
  await db
    .insert(stepFlowProgress)
    .values({
      flowId: data.flowId,
      userId: data.userId,
      currentStepIndex: data.currentStepIndex,
      completedSteps: data.completedSteps,
      skippedSteps: data.skippedSteps,
      stepData: data.stepData,
      progress: data.progress,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [stepFlowProgress.userId, stepFlowProgress.flowId],
      set: {
        currentStepIndex: data.currentStepIndex,
        completedSteps: data.completedSteps,
        skippedSteps: data.skippedSteps,
        stepData: data.stepData,
        progress: data.progress,
        updatedAt: new Date(),
      },
    });
}

export async function loadTutorialProgress(
  userId: string,
  flowId: string,
): Promise<PersistedStepFlow<ContributionTutorialStepData> | null> {
  const result = await db
    .select()
    .from(stepFlowProgress)
    .where(
      and(
        eq(stepFlowProgress.userId, userId),
        eq(stepFlowProgress.flowId, flowId),
      ),
    )
    .limit(1);

  if (!result.length) return null;

  const progress = result[0];
  return {
    id: progress.id,
    flowId: progress.flowId,
    userId: progress.userId,
    currentStepIndex: progress.currentStepIndex,
    completedSteps: progress.completedSteps as string[],
    skippedSteps: progress.skippedSteps as string[],
    stepData: progress.stepData as Record<string, ContributionTutorialStepData>,
    progress: progress.progress,
    isCompleted: progress.progress === 100,
    createdAt: progress.createdAt,
    updatedAt: progress.updatedAt,
  };
}

export async function isTutorialCompleted(
  userId: string,
  fairteilerId: string,
): Promise<boolean> {
  const flowId = `contribution-tutorial-${fairteilerId}`;
  const progress = await loadTutorialProgress(userId, flowId);

  if (!progress) return false;

  return progress.progress >= 100;
}
