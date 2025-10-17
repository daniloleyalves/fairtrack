import { handleAsyncAction } from '@/lib/client-error-handling';
import {
  createStepFlow,
  createStepFlowAPI,
  StepConfig,
} from '@/lib/factories/step-flow-factory';
import { saveOnboardingProgressAction } from '@/server/actions';
import { OnboardingData } from '@/server/dto';
import {
  OnboardingMetadata,
  OnboardingStepData,
} from './onboarding-flow-types';

export const USER_ONBOARDING_FLOW_ID = 'onboarding';

// Simplified API that only handles progress saving
const createOnboardingAPI = () =>
  createStepFlowAPI<OnboardingStepData>({
    async saveProgress(data) {
      await handleAsyncAction(
        () => saveOnboardingProgressAction(data),
        undefined,
        {
          showToast: false,
        },
      );
    },
  });

const createOnboardingSteps = (): StepConfig<
  OnboardingStepData,
  OnboardingMetadata
>[] => [
  {
    id: 'welcome',
    title: '',
    description: '',
    persistProgress: true,
    requiresUserAction: false,
  },
  {
    id: 'how-to',
    title: '',
    description: '',
    persistProgress: true,
    requiresUserAction: false,
  },
  {
    id: 'foodsharing-experience',
    title: 'Bist du schon Foodsaver*in?',
    description:
      'Teile uns deine Erfahrung mit, damit FairTrack dich besser unterstützen kann.',
    persistProgress: true,
    requiresUserAction: true,
  },
  {
    id: 'enable-gamification',
    title: 'Motivationsmodus',
    description:
      'Anreize können dein Foodsharing-Erlebnis spannender gestalten. ',
    persistProgress: true,
    requiresUserAction: false,
  },
  {
    id: 'complete',
    title: '',
    description: '',
    persistProgress: true,
    requiresUserAction: false,
  },
];

export const createOnboardingFlow = (initialData?: OnboardingData) => {
  const api = createOnboardingAPI();
  const steps = createOnboardingSteps();

  // Convert database format to expected format
  const initialProgress = initialData?.stepFlowProgress
    ? {
        ...initialData.stepFlowProgress,
        isCompleted: initialData.stepFlowProgress.progress === 100,
        completedSteps:
          (initialData.stepFlowProgress.completedSteps as string[]) ?? [],
        skippedSteps:
          (initialData.stepFlowProgress.skippedSteps as string[]) ?? [],
        stepData:
          (initialData.stepFlowProgress.stepData as Record<
            string,
            OnboardingStepData
          >) ?? {},
      }
    : null;

  // Initialize gamification step data if not present
  if (initialData?.gamificationElements && initialProgress) {
    if (!initialProgress.stepData['enable-gamification']) {
      const enabledElements = initialData.gamificationElements.map(
        (element) => ({
          ...element,
          enabled: true,
        }),
      );
      initialProgress.stepData['enable-gamification'] = {
        selectedGamificationElements: enabledElements,
      };
    }
  }

  return createStepFlow(
    USER_ONBOARDING_FLOW_ID,
    initialData?.user?.id ?? '',
    api,
    steps,
    initialProgress,
  );
};
