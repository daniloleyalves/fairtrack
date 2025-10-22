'use server';

import {
  addCategory,
  addCompany,
  addFairteilerCategory,
  addFairteilerCompany,
  addFairteilerOrigin,
  addOrigin,
  addTagToFairteiler,
  addVersionHistoryRecord,
  checkinContribution,
  removeFairteilerTutorial,
  loadAuthenticatedSession,
  loadContributions,
  removeFairteilerCategory,
  removeFairteilerCompany,
  removeFairteilerOrigin,
  removeTagFromFairteiler,
  addExperienceLevelEvent,
  addStepFlowProgress,
  addUserPreferences,
  submitUserFeedbackWithDetails,
  updateFairteilerTutorial,
  updateFirstLogin,
  updateUserPreferences,
  addFairteilerTutorial,
  removeFairteilerTutorialStep,
  addFairteilerTutorialStep,
  updateFairteilerTutorialStep,
  updateOrigin,
  updateCategory,
  updateCompany,
} from './dal';
import {
  contributionEditSchema,
  contributionFormSchema,
} from '@features/contribution/schemas/contribution-schema';
import {
  NotFoundError,
  PermissionError,
  ValidationError,
} from './error-handling';
import { AuthError, handleImageUpload } from './api-helpers';
import { ActionState, createAction } from './action-helpers';
import { z, ZodError } from 'zod';
import { headers } from 'next/headers';
import {
  FairteilerTutorialStep,
  GenericItem,
  Tag,
  vContribution,
} from './db/db-types';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { OnboardingStepData } from '@/features/user/onboarding/onboarding-flow-types';
import { formTableViewEnum } from './db/schema';
import { sendFeedbackNotification } from '@/lib/services/resend/feedback-notification';
import {
  fairteilerTutorialSchema,
  fairteilerTutorialStepSchema,
} from '@/features/fairteiler/tutorial/schemas/fairteiler-tutorial-schema';
import { feedbackSchema } from '@/features/feedback/schemas/feedack-schema';
import { BetterAuthError } from 'better-auth';
import { ANONYMOUS_USER_NAME, getErrorMessage } from '@/lib/auth/auth-helpers';

const genericItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name ist erforderlich'),
  status: z.enum(['active', 'pending', 'disabled']).optional(),
});

export const suggestNewOriginAction = createAction({
  inputSchema: genericItemSchema,
  handler: async ({ input, headers }) => {
    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const addedOrigin = await addOrigin(input);

    if (!addedOrigin) {
      throw new NotFoundError('Origin', 'after creation');
    }

    return {
      message: 'Herkunft erfolgreich vorgeschlagen.',
      data: input,
    };
  },
});

export async function addFairteilerOriginAction(
  originToAdd: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const fairteilerOrigins = await addFairteilerOrigin(
      fairteilerId,
      originToAdd,
    );

    if (!fairteilerOrigins) {
      throw new Error('Failed to add origin to fairteiler');
    }

    return originToAdd;
  } catch (error) {
    console.error('Error in addFairteilerOriginAction:', error);
    throw error;
  }
}

export async function removeFairteilerOriginAction(
  originToRemove: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedOriginFromFairteiler = await removeFairteilerOrigin(
      fairteilerId,
      originToRemove,
    );

    if (!removedOriginFromFairteiler) {
      throw new NotFoundError('Origin to remove');
    }

    return originToRemove;
  } catch (error) {
    console.error('Error in removeFairteilerOriginAction:', error);
    throw error;
  }
}

export async function updateOriginAction(
  originToUpdate: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const updatedOrigin = await updateOrigin(originToUpdate);

    if (!updatedOrigin) {
      throw new NotFoundError('Origin to update');
    }

    return originToUpdate;
  } catch (error) {
    console.error('Error in updateOriginAction:', error);
    throw error;
  }
}

// CATEGORY SELECTION

export const suggestNewCategoryAction = createAction({
  inputSchema: genericItemSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const addedCategory = await addCategory(input);

    if (!addedCategory) {
      throw new NotFoundError('Category', 'after creation');
    }

    return {
      message: 'Kategorie erfolgreich vorgeschlagen.',
      data: input,
    };
  },
});

export async function addFairteilerCategoryAction(
  categoryToAdd: GenericItem,
): Promise<GenericItem> {
  const nextHeaders = await headers();
  const session = await loadAuthenticatedSession(nextHeaders);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }

  try {
    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const fairteilerCategories = await addFairteilerCategory(
      fairteilerId,
      categoryToAdd,
    );

    if (!fairteilerCategories) {
      throw new Error('Failed to add category to fairteiler');
    }

    return categoryToAdd;
  } catch (error) {
    console.error('Error in addFairteilerCategoryAction:', error);
    throw error;
  }
}

export async function removeFairteilerCategoryAction(
  categoryToRemove: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedCategoryFromFairteiler = await removeFairteilerCategory(
      fairteilerId,
      categoryToRemove,
    );

    if (!removedCategoryFromFairteiler) {
      throw new NotFoundError('Category to remove');
    }

    return categoryToRemove;
  } catch (error) {
    console.error('Error in removeFairteilerCategoryAction:', error);
    throw error;
  }
}

export async function updateCategoryAction(
  categoryToUpdate: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const updatedCategory = await updateCategory(categoryToUpdate);

    if (!updatedCategory) {
      throw new NotFoundError('Category to update');
    }

    return categoryToUpdate;
  } catch (error) {
    console.error('Error in updateCategoryAction:', error);
    throw error;
  }
}

// COMPANY SELECTION

export const suggestNewCompanyAction = createAction({
  inputSchema: genericItemSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const addedCompany = await addCompany(fairteilerId, input);

    if (!addedCompany) {
      throw new Error('Failed to create new company');
    }

    return {
      message: 'Betrieb erfolgreich vorgeschlagen.',
      data: input,
    };
  },
});

export async function addFairteilerCompanyAction(
  companyToAdd: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const fairteilerCompanies = await addFairteilerCompany(
      fairteilerId,
      companyToAdd,
    );

    if (!fairteilerCompanies) {
      throw new Error('Failed to add company to fairteiler');
    }

    return companyToAdd;
  } catch (error) {
    console.error('Error in addFairteilerCompanyAction:', error);
    throw error;
  }
}

export async function removeFairteilerCompanyAction(
  companyToRemove: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedCompanyFromFairteiler = await removeFairteilerCompany(
      fairteilerId,
      companyToRemove,
    );

    if (!removedCompanyFromFairteiler) {
      throw new NotFoundError('Company to remove');
    }

    return companyToRemove;
  } catch (error) {
    console.error('Error in removeFairteilerCompanyAction:', error);
    throw error;
  }
}

export async function updateCompanyAction(
  companyToUpdate: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const updatedCompany = await updateCompany(companyToUpdate);

    if (!updatedCompany) {
      throw new NotFoundError('Company to update');
    }

    return companyToUpdate;
  } catch (error) {
    console.error('Error in updateCompanyAction:', error);
    throw error;
  }
}

export async function addTagToFairteilerAction(tag: Tag) {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      organization: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const newTag = await addTagToFairteiler({ ...tag, fairteilerId });

    if (!newTag) {
      throw new Error('Failed to add tag to fairteiler');
    }

    return tag;
  } catch (error) {
    console.error('Error in addTagToFairteilerAction:', error);
    throw error;
  }
}

export async function removeTagFromFairteilerAction(tagToRemove: Tag) {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      organization: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedTagFromFairteiler = await removeTagFromFairteiler(
      fairteilerId,
      tagToRemove.id ?? '',
    );

    if (!removedTagFromFairteiler) {
      throw new NotFoundError('Tag to remove');
    }

    return tagToRemove;
  } catch (error) {
    console.error('Error in removeTagFromFairteilerAction:', error);
    throw error;
  }
}

export const submitContributionAction = createAction({
  inputSchema: contributionFormSchema,
  revalidate: '/hub',
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    if (!session) {
      throw new AuthError('No active session');
    }

    if (!input.config?.fairteilerId) {
      throw new AuthError('FairteilerId cannot be undefined');
    }

    if (input.contributions.length <= 0) {
      throw new ValidationError('Keine Einträge gefunden.');
    }

    await checkinContribution(
      input.config.fairteilerId,
      session.user.id,
      input.contributions,
    );

    // Determine context-specific behavior
    const defaultRevalidatePaths = ['/hub/user/dashboard'];
    const defaultSuccessRedirect = '/hub/user/contribution/success';

    // Use config overrides or defaults based on context
    const revalidatePaths =
      input.config?.revalidatePaths ?? defaultRevalidatePaths;
    const successRedirect =
      input.config?.successRedirect ?? defaultSuccessRedirect;

    return {
      message: 'Lebensmittel erfolgreich beigetragen!',
      data: { redirectTo: successRedirect },
      revalidatePaths,
    };
  },
});

export const editContributionAction = createAction({
  inputSchema: contributionEditSchema,
  revalidate: '/hub/fairteiler/dashboard',
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    await addVersionHistoryRecord(fairteilerId, session.user.id, input);

    return {
      message: 'Beitrag erfolgreich bearbeitet.',
      data: input,
    };
  },
});

const exportContributionsSchema = z.object({
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  scope: z.enum(['fairteiler', 'platform']).default('fairteiler'),
});

export const exportContributionsAction = createAction({
  inputSchema: exportContributionsSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);

    // Determine scope and validate permissions
    let fairteilerId: string | null = null;
    if (input.scope === 'fairteiler') {
      fairteilerId = session.session.activeOrganizationId ?? null;
      if (!fairteilerId) {
        throw new AuthError('No active organization');
      }
    } else {
      // Platform export requires admin permissions
      if (session.user.role !== 'admin') {
        throw new AuthError('Admin access required for platform export');
      }
    }

    // Fetch contributions data
    const contributionsResult = await loadContributions({
      fairteilerId,
      dateRange: input.dateRange,
    });

    if (!contributionsResult?.data?.length) {
      throw new NotFoundError('No contributions found for export');
    }

    // Apply anonymization based on user preferences
    const anonymizedData = contributionsResult.data.map((contribution) => {
      const isAnonymous = contribution.contributorIsAnonymous ?? false;

      if (isAnonymous) {
        return {
          ...contribution,
          contributorName: ANONYMOUS_USER_NAME,
          contributorEmail: null,
          contributorImage: null,
        };
      }
      return contribution;
    });

    const typecheckedData = anonymizedData satisfies vContribution[];
    const message =
      input.scope === 'fairteiler'
        ? 'Fairteiler-Daten erfolgreich exportiert.'
        : 'Plattform-Daten erfolgreich exportiert.';

    return {
      message,
      data: typecheckedData,
    };
  },
});

// STEP FLOWS ------------

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

    return {
      message: 'Onboarding-Vortschritt gespeichert',
      data: null,
    };
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

    // Save experience level event if a level was selected
    if (input.selectedLevel) {
      savedLevel = await addExperienceLevelEvent(
        input.selectedLevel.id,
        userId,
      );
    }
    // Save user preferences based on selected gamification elements
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
      message: 'Onboarding erfolgreich!',
      data: {
        userId,
        savedLevel,
        savedPreferences,
        onboardingCompleted: true,
        redirectTo: '/hub/user/dashboard',
      },
    };
  },
});

// contributon tutorial step flow
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

    return {
      message: 'Anleitung-Vortschritt gespeichert',
      data: null,
    };
  },
});

// USER PREFERENCES -------
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

    const result = await updateUserPreferences(userId, input);

    return {
      message: 'Platformerlebnis erfolgreich aktualisiert!',
      data: result,
    };
  },
});

// FEEDBACK ACTIONS -------

export const submitFeedbackAction = createAction({
  inputSchema: feedbackSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const userId = session.user.id;
    if (!userId) {
      throw new AuthError('No active session');
    }

    // Get fairteiler ID if user has an active organization
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

    // Send email notification in the background (non-blocking)
    // Import the email service dynamically to avoid server-side issues

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
      const result = await sendFeedbackNotification(emailData);
      if (!result.success) {
        console.error(
          'Failed to send feedback notification email:',
          result.error,
        );
      }
    } catch (error) {
      console.error('Error sending feedback notification email:', error);
    }

    return {
      message: 'Feedback erfolgreich gesendet!',
      data: result,
    };
  },
});

// TUTORIAL ACTIONS -----------

export const addFairteilerTutorialAction = createAction({
  inputSchema: fairteilerTutorialSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;

    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await addFairteilerTutorial(fairteilerId, {
      ...input,
      fairteilerId,
    });

    if (!result) {
      throw new Error('Failed to create tutorial');
    }

    return {
      message: 'Tutorial erfolgreich erstellt!',
      data: result,
    };
  },
});

export const updateFairteilerTutorialAction = createAction({
  inputSchema: fairteilerTutorialSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    if (!input.id) {
      throw new Error('Failed to update tutorial');
    }

    const updatedTutorial = {
      fairteilerId,
      title: input.title,
      isActive: input.isActive,
    };

    const result = await updateFairteilerTutorial(input.id, updatedTutorial);

    if (!result) {
      throw new Error('Failed to update tutorial');
    }

    return {
      message: 'Tutorial erfolgreich aktualisiert!',
      data: result,
    };
  },
});

export const removeFairteilerTutorialAction = createAction({
  inputSchema: z.object({ id: z.string() }),
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);

    if (!session.session.activeOrganizationId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await removeFairteilerTutorial(input.id);

    if (!result) {
      throw new Error('Failed to delete tutorial');
    }

    return {
      message: 'Tutorial erfolgreich gelöscht!',
      data: result,
    };
  },
});

// TUTORIAL Step ACTIONS -----------

// Custom action for FormData handling (tutorial step creation)
export async function addFairteilerTutorialStepAction(
  formData: FormData,
): Promise<ActionState<z.infer<typeof fairteilerTutorialStepSchema>>> {
  try {
    const rawData = Object.fromEntries(formData.entries());

    // Convert sortIndex to number and remove id for creation
    const validation = fairteilerTutorialStepSchema
      .omit({ id: true })
      .safeParse({
        ...rawData,
        sortIndex: rawData.sortIndex ? Number(rawData.sortIndex) : 1,
        media: rawData.media ?? null,
      });

    if (!validation.success) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: validation.error.issues,
      };
    }

    // Get tutorialId from FormData
    const tutorialId = rawData.tutorialId as string;
    if (!tutorialId) {
      throw new Error('Tutorial ID is required for creating steps');
    }

    const nextHeaders = await headers();

    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError('cannot create tutorial step');
    }

    const { media, ...otherValues } = validation.data;

    // Handle media upload
    const newMediaUrl = await handleImageUpload(
      media,
      null,
      'fairteilerTutorialMedia',
    );

    const finalData = {
      ...otherValues,
      media: newMediaUrl,
      tutorialId,
    };

    await addFairteilerTutorialStep(tutorialId, finalData);

    return {
      success: true,
      message: 'Anleitungs-Schritt erfolgreich erstellt!',
      data: validation.data,
    };
  } catch (error) {
    console.error('Add tutorial step error:', error);
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: error.issues,
      };
    }
    if (error instanceof BetterAuthError) {
      const message = getErrorMessage(
        typeof error.cause === 'string' ? error.cause : undefined,
        'de',
      );
      return { success: false, error: `Erstellung fehlgeschlagen: ${message}` };
    }
    if (error instanceof PermissionError) {
      const message = getErrorMessage(
        'YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION',
        'de',
      );
      return { success: false, error: `Erstellung fehlgeschlagen: ${message}` };
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Ein unerwarteter Fehler ist aufgetreten.';
    return { success: false, error: `Erstellung fehlgeschlagen: ${message}` };
  }
}

// Custom action for FormData handling (tutorial step updates)
export async function updateFairteilerTutorialStepAction(
  formData: FormData,
): Promise<ActionState<z.infer<typeof fairteilerTutorialStepSchema>>> {
  try {
    const rawData = Object.fromEntries(formData.entries());

    // Convert sortIndex to number
    const validation = fairteilerTutorialStepSchema.safeParse({
      ...rawData,
      sortIndex: rawData.sortIndex ? Number(rawData.sortIndex) : 1,
      media: rawData.media ?? null,
    });

    if (!validation.success) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: validation.error.issues,
      };
    }

    const nextHeaders = await headers();

    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError('cannot update tutorial step');
    }

    if (!validation.data.id) {
      throw new Error('Tutorial step ID is required for updates');
    }

    const { media, id, ...otherValues } = validation.data;

    // Handle media upload - for updates, we pass null as current media since we don't have it
    // The handleImageUpload function will handle the upload correctly
    const newMediaUrl = await handleImageUpload(
      media,
      null, // Current media URL - we could enhance this later to get from DB
      'fairteilerTutorialMedia',
    );

    // Get tutorialId from FormData for updates as well
    const tutorialId = rawData.tutorialId as string;
    if (!tutorialId) {
      throw new Error('Tutorial ID is required for updating steps');
    }

    const finalData = {
      ...otherValues,
      media: newMediaUrl,
      tutorialId, // Include tutorialId as required by the type
    };

    await updateFairteilerTutorialStep(id, finalData);

    return {
      success: true,
      message: 'Anleitungs-Schritt erfolgreich aktualisiert!',
      data: validation.data,
    };
  } catch (error) {
    console.error('Update tutorial step error:', error);
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: error.issues,
      };
    }
    if (error instanceof BetterAuthError) {
      const message = getErrorMessage(
        typeof error.cause === 'string' ? error.cause : undefined,
        'de',
      );
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    if (error instanceof PermissionError) {
      const message = getErrorMessage(
        'YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION',
        'de',
      );
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Ein unerwarteter Fehler ist aufgetreten.';
    return { success: false, error: `Update fehlgeschlagen: ${message}` };
  }
}

export const removeFairteilerTutorialStepAction = createAction({
  inputSchema: z.object({ id: z.string() }),
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);

    if (!session.session.activeOrganizationId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await removeFairteilerTutorialStep(input.id);

    if (!result) {
      throw new Error('Failed to delete tutorial');
    }

    return {
      message: 'Tutorial erfolgreich gelöscht!',
      data: result,
    };
  },
});

// // AI FEEDBACK ACTIONS -------

// export const generateUserFeedbackAction = createAction({
//   inputSchema: userFeedbackDataSchema,
//   handler: async ({ input, headers }) => {
//     const session = await loadAuthenticatedSession(headers);
//     if (!session.user.id) {
//       throw new AuthError('No active session');
//     }

//     // Check if user has AI feedback enabled in preferences
//     // This would require checking user preferences from the database
//     // For now, we'll proceed with generation

//     try {
//       const feedback = await generatePersonalizedFeedback(
//         input,
//         session.user.id,
//       );

//       return {
//         message: 'Personalisiertes Feedback erfolgreich generiert!',
//         data: { feedback },
//       };
//     } catch (error) {
//       console.error('Error generating AI feedback:', error);

//       if (error instanceof RateLimitError) {
//         throw new ValidationError(error.message);
//       }

//       if (error instanceof OpenAIError) {
//         throw new ValidationError(error.message);
//       }

//       throw new Error('Fehler beim Generieren des personalisierten Feedbacks');
//     }
//   },
// });
