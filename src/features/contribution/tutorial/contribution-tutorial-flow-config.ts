'use client';

import { handleAsyncAction } from '@/lib/client-error-handling';
import {
  createStepFlow,
  createStepFlowAPI,
  PersistedStepFlow,
  FlowCompletionConfig,
} from '@/lib/factories/step-flow-factory';
import { saveContributionTutorialProgressAction } from '@/server/actions';
import { FairteilerTutorialStep } from '@/server/db/db-types';
import { useRouter } from 'next/navigation';

export const CONTRIBUTION_TUTORIAL_FLOW_ID = 'contribution-tutorial';

const tutorialStepConfig = (steps: FairteilerTutorialStep[]) => {
  return steps.map((step) => ({
    id: step.id ?? '',
    title: step.title,
    canSkip: false,
    persistProgress: true,
    metadata: step,
  }));
};

const createTutorialAPI = () =>
  createStepFlowAPI<FairteilerTutorialStep>({
    async saveProgress(data) {
      await handleAsyncAction(
        () => saveContributionTutorialProgressAction(data),
        undefined,
        {
          showToast: false,
        },
      );
    },
  });

// Hook that provides router access for completion config
function useTutorialCompletionConfig(
  fairteilerSlug: string,
): FlowCompletionConfig<FairteilerTutorialStep> {
  const router = useRouter();

  return {
    onFlowComplete: () => {
      router.push(`/hub/user/contribution?fairteilerSlug=${fairteilerSlug}`);
    },
  };
}

export function createContributionTutorialFlow(
  userId: string,
  fairteilerId: string,
  fairteilerSlug: string,
  steps: FairteilerTutorialStep[],
  initialProgress?: PersistedStepFlow<FairteilerTutorialStep> | null,
) {
  const flowId = `${CONTRIBUTION_TUTORIAL_FLOW_ID}-${fairteilerId}`;
  const api = createTutorialAPI();

  // Create a factory function that returns the hook
  return function useTutorialFlow() {
    const completionConfig = useTutorialCompletionConfig(fairteilerSlug);

    return createStepFlow<FairteilerTutorialStep, FairteilerTutorialStep>(
      flowId,
      userId,
      api,
      tutorialStepConfig(steps),
      initialProgress,
      completionConfig,
    )();
  };
}
