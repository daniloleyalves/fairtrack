'use server';

import { revalidatePath } from 'next/cache';
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
import { authedAction } from '../_lib/safe-action';
import { ValidationError } from '../error-handling';
import { FairteilerTutorialStep } from '../db/db-types';
import { formTableViewEnum } from '../db/schema';
import { OnboardingStepData } from '@/features/user/onboarding/onboarding-flow-types';
import { sendFeedbackNotification } from '@/lib/services/resend/feedback-notification';
import { feedbackSchema } from '@/features/feedback/schemas/feedack-schema';
import { headers } from 'next/headers';

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

export const saveOnboardingProgressAction = authedAction
  .inputSchema(stepFlowDataSchema)
  .action(async ({ parsedInput, ctx }) => {
    await addStepFlowProgress<OnboardingStepData>({
      ...parsedInput,
      userId: ctx.session.user.id,
    });
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

export const completeOnboardingAction = authedAction
  .inputSchema(completeOnboardingSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.session.user.id;

    let savedLevel = null;
    let savedPreferences = null;

    if (parsedInput.selectedLevel) {
      savedLevel = await addExperienceLevelEvent(
        parsedInput.selectedLevel.id,
        userId,
      );
    }
    if (parsedInput.selectedGamificationElements) {
      const preferences: {
        enableStreaks?: boolean;
        enableQuests?: boolean;
        enableAIFeedback?: boolean;
        isAnonymous?: boolean;
      } = {};
      parsedInput.selectedGamificationElements.forEach((element) => {
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
    await loadAuthenticatedSession(await headers(), true);
    revalidatePath('/hub');
    return {
      userId,
      savedLevel,
      savedPreferences,
      onboardingCompleted: true,
      redirectTo: '/hub/user/dashboard',
    };
  });

export const saveContributionTutorialProgressAction = authedAction
  .inputSchema(stepFlowDataSchema)
  .action(async ({ parsedInput, ctx }) => {
    await addStepFlowProgress<FairteilerTutorialStep>({
      ...parsedInput,
      userId: ctx.session.user.id,
    });
  });

const preferencesSchema = z.object({
  formTableView: z.enum(formTableViewEnum.enumValues).default('wizard'),
  enableStreaks: z.boolean().default(false),
  enableQuests: z.boolean().default(false),
  enableAIFeedback: z.boolean().default(false),
});

export const updateUserPreferencesAction = authedAction
  .inputSchema(preferencesSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!parsedInput) {
      throw new ValidationError('Keine Einträge gefunden.');
    }
    const result = await updateUserPreferences(
      ctx.session.user.id,
      parsedInput,
    );
    revalidatePath('/hub/user/settings');
    return result;
  });

export const submitFeedbackAction = authedAction
  .inputSchema(feedbackSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.session.user.id;
    const fairteilerId = ctx.session.session.activeOrganizationId ?? null;

    const result = await submitUserFeedbackWithDetails(
      userId,
      fairteilerId,
      parsedInput.category,
      parsedInput.message,
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
  });
