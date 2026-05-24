'use server';

import { z } from 'zod';
import {
  addExperienceLevelEvent,
  addUserPreferences,
  loadAuthenticatedSession,
  submitUserFeedbackWithDetails,
  updateFirstLogin,
  updateUserPreferences,
} from './dal';
import { addStepFlowProgress } from '../tutorial/dal';
import { createAction } from '../action-helpers';
import { AuthError } from '../api-helpers';
import { ValidationError } from '../error-handling';
import { FairteilerTutorialStep } from '../db/db-types';
import { formTableViewEnum } from '../db/schema';
import { OnboardingStepData } from '@/features/user/onboarding/onboarding-flow-types';
import { sendFeedbackNotification } from '@/lib/services/resend/feedback-notification';
import { feedbackSchema } from '@/features/feedback/schemas/feedack-schema';

const stepFlowDataSchema = z.object({
  flowId: z.string(),
  userId: z.string(),
  currentStepIndex: z.number(),
  completedSteps: z.array(z.string()),
  skippedSteps: z.array(z.string()),
  stepData: z.any(),
  progress: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const saveOnboardingProgressAction = createAction({
  inputSchema: stepFlowDataSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    if (!session.session) {
      throw new AuthError('No active session');
    }

    await addStepFlowProgress<OnboardingStepData>({
      ...input,
      userId: session.user.id,
    });
  },
});

const completeOnboardingSchema = z.object({
  selectedLevel: z
    .object({
      id: z.string(),
      icon: z.string(),
      name: z.string(),
      value: z.string(),
      sortIndex: z.number().int().min(0),
    })
    .optional(),
  selectedGamificationElements: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        active: z.boolean(),
        enabled: z.boolean(),
        description: z.string(),
      }),
    )
    .optional(),
});

export const completeOnboardingAction = createAction({
  inputSchema: completeOnboardingSchema,
  revalidate: '/hub',
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const userId = session.user.id;
    if (!userId) {
      throw new AuthError('No active session');
    }

    let savedLevel = null;
    let savedPreferences = null;

    if (input.selectedLevel) {
      savedLevel = await addExperienceLevelEvent(
        input.selectedLevel.id,
        userId,
      );
    }
    if (input.selectedGamificationElements) {
      const preferences: {
        enableStreaks?: boolean;
        enableQuests?: boolean;
        enableAIFeedback?: boolean;
        isAnonymous?: boolean;
      } = {};
      input.selectedGamificationElements.forEach((element) => {
        switch (element.id) {
          case 'streaks':
            preferences.enableStreaks = element.enabled;
            break;
          case 'quests':
            preferences.enableQuests = element.enabled;
            break;
          case 'ai_feedback':
            preferences.enableAIFeedback = element.enabled;
            break;
        }
      });
      savedPreferences = await addUserPreferences(userId, preferences);
    }
    await updateFirstLogin(userId, false);
    await loadAuthenticatedSession(headers, true);
    return {
      userId,
      savedLevel,
      savedPreferences,
      onboardingCompleted: true,
      redirectTo: '/hub/user/dashboard',
    };
  },
});

export const saveContributionTutorialProgressAction = createAction({
  inputSchema: stepFlowDataSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    if (!session.session) {
      throw new AuthError('No active session');
    }

    await addStepFlowProgress<FairteilerTutorialStep>({
      ...input,
      userId: session.user.id,
    });
  },
});

const preferencesSchema = z.object({
  formTableView: z.enum(formTableViewEnum.enumValues).default('wizard'),
  enableStreaks: z.boolean().default(false),
  enableQuests: z.boolean().default(false),
  enableAIFeedback: z.boolean().default(false),
});

export const updateUserPreferencesAction = createAction({
  inputSchema: preferencesSchema,
  revalidate: '/hub/user/settings',
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const userId = session.user.id;
    if (!userId) {
      throw new AuthError('No active session');
    }

    if (!input) {
      throw new ValidationError('Keine Einträge gefunden.');
    }

    return await updateUserPreferences(userId, input);
  },
});

export const submitFeedbackAction = createAction({
  inputSchema: feedbackSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const userId = session.user.id;
    if (!userId) {
      throw new AuthError('No active session');
    }

    const fairteilerId = session.session.activeOrganizationId ?? null;

    const result = await submitUserFeedbackWithDetails(
      userId,
      fairteilerId,
      input.category,
      input.message,
    );

    if (!result) {
      throw new Error('Failed to submit feedback');
    }

    const emailData = {
      category: result.category,
      message: result.message,
      userName: result.userName,
      userEmail: result.userEmail,
      fairteilerName: result.fairteilerName ?? undefined,
      submittedAt: new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(result.createdAt)),
    };

    try {
      const notifyResult = await sendFeedbackNotification(emailData);
      if (!notifyResult.success) {
        console.error(
          'Failed to send feedback notification email:',
          notifyResult.error,
        );
      }
    } catch (error) {
      console.error('Error sending feedback notification email:', error);
    }

    return result;
  },
});
