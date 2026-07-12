import 'server-only';
import { cache } from 'react';
import { and, eq, inArray } from 'drizzle-orm';
import { attempt } from '@/lib/attempt';
import { db } from '../db/drizzle';
import {
  fairteilerTutorial,
  fairteilerTutorialStep,
  stepFlowProgress,
} from '../db/schema';
import { FairteilerTutorial, FairteilerTutorialStep } from '../db/db-types';
import { DatabaseError, handleDatabaseError } from '../error-handling';
import { PersistedStepFlow } from '@/lib/factories/step-flow-factory';

/**
 * Load step flow progress for a specific flow and user
 */
export const loadStepFlowProgress = cache(
  async (userId: string, flowId: string) => {
    const [error, data] = await attempt(
      db.query.stepFlowProgress.findFirst({
        where: and(
          eq(stepFlowProgress.flowId, flowId),
          eq(stepFlowProgress.userId, userId),
        ),
      }),
    );

    if (error) handleDatabaseError(error, 'loadStepFlowProgress');
    return data;
  },
);

export async function addStepFlowProgress<T>(
  data: Partial<PersistedStepFlow<T>> & {
    flowId: string;
    userId: string;
  },
) {
  const [error] = await attempt(
    db
      .insert(stepFlowProgress)
      .values({
        flowId: data.flowId,
        userId: data.userId,
        currentStepIndex: data.currentStepIndex ?? 0,
        completedSteps: data.completedSteps ?? [],
        skippedSteps: data.skippedSteps ?? [],
        stepData: data.stepData ?? {},
        progress: data.progress ?? 0,
        createdAt: new Date(),
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
      }),
  );

  if (error) handleDatabaseError(error, 'addStepFlowProgress');
}

export const loadFairteilerTutorialWithSteps = cache(
  async (fairteilerId: string) => {
    const [error, data] = await attempt(
      db.query.fairteilerTutorial.findFirst({
        where: eq(fairteilerTutorial.fairteilerId, fairteilerId),
        with: {
          steps: {
            orderBy: (step, { asc }) => [asc(step.sortIndex)],
          },
        },
      }),
    );

    if (error) handleDatabaseError(error, 'loadFairteilerTutorialWithSteps');

    return data;
  },
);

export const addFairteilerTutorial = async (
  fairteilerId: string,
  tutorial: FairteilerTutorial,
) => {
  const [error, data] = await attempt(
    db
      .insert(fairteilerTutorial)
      .values({
        id: tutorial.id,
        fairteilerId,
        title: tutorial.title,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'addFairteilerTutorial');
  return data;
};

export const tutorialBelongsToFairteiler = async (
  tutorialId: string,
  fairteilerId: string,
) => {
  const [error, data] = await attempt(
    db.query.fairteilerTutorial.findFirst({
      where: and(
        eq(fairteilerTutorial.id, tutorialId),
        eq(fairteilerTutorial.fairteilerId, fairteilerId),
      ),
      columns: { id: true },
    }),
  );

  if (error) handleDatabaseError(error, 'tutorialBelongsToFairteiler');
  return Boolean(data);
};

export const updateFairteilerTutorial = async (
  tutorialId: string,
  fairteilerId: string,
  updatedTutorialData: FairteilerTutorial,
) => {
  const [error, data] = await attempt(
    db
      .update(fairteilerTutorial)
      .set({
        title: updatedTutorialData.title,
        isActive: updatedTutorialData.isActive,
      })
      .where(
        and(
          eq(fairteilerTutorial.id, tutorialId),
          eq(fairteilerTutorial.fairteilerId, fairteilerId),
        ),
      )
      .returning(),
  );

  if (error) handleDatabaseError(error, 'updateFairteilerTutorial');
  return data;
};

export const removeFairteilerTutorial = async (
  tutorialId: string,
  fairteilerId: string,
) => {
  const [error, data] = await attempt(
    db
      .delete(fairteilerTutorial)
      .where(
        and(
          eq(fairteilerTutorial.id, tutorialId),
          eq(fairteilerTutorial.fairteilerId, fairteilerId),
        ),
      )
      .returning(),
  );

  if (error) handleDatabaseError(error, 'deleteFairteilerTutorial');
  return data;
};

export const addFairteilerTutorialStep = async (
  tutorialId: string,
  tutorial: FairteilerTutorialStep,
) => {
  const [error, data] = await attempt(
    db
      .insert(fairteilerTutorialStep)
      .values({
        tutorialId,
        title: tutorial.title,
        content: tutorial.content,
        media: tutorial.media,
        sortIndex: tutorial.sortIndex,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'addFairteilerTutorialStep');
  return data;
};

const stepsOwnedByFairteiler = (fairteilerId: string) =>
  inArray(
    fairteilerTutorialStep.tutorialId,
    db
      .select({ id: fairteilerTutorial.id })
      .from(fairteilerTutorial)
      .where(eq(fairteilerTutorial.fairteilerId, fairteilerId)),
  );

export const updateFairteilerTutorialStep = async (
  tutorialStepId: string,
  fairteilerId: string,
  updatedTutorialStepData: FairteilerTutorialStep,
) => {
  if (
    updatedTutorialStepData.media &&
    typeof updatedTutorialStepData.media !== 'string'
  ) {
    throw new DatabaseError('media url is not of type string');
  }

  const [error, data] = await attempt(
    db
      .update(fairteilerTutorialStep)
      .set({
        title: updatedTutorialStepData.title,
        content: updatedTutorialStepData.content,
        media: updatedTutorialStepData.media,
        sortIndex: updatedTutorialStepData.sortIndex,
      })
      .where(
        and(
          eq(fairteilerTutorialStep.id, tutorialStepId),
          stepsOwnedByFairteiler(fairteilerId),
        ),
      )
      .returning(),
  );

  if (error) handleDatabaseError(error, 'updateFairteilerTutorialStep');
  return data;
};

export const removeFairteilerTutorialStep = async (
  tutorialStepId: string,
  fairteilerId: string,
) => {
  const [error, data] = await attempt(
    db
      .delete(fairteilerTutorialStep)
      .where(
        and(
          eq(fairteilerTutorialStep.id, tutorialStepId),
          stepsOwnedByFairteiler(fairteilerId),
        ),
      )
      .returning(),
  );

  if (error) handleDatabaseError(error, 'deleteFairteilerTutorialStep');
  return data;
};
