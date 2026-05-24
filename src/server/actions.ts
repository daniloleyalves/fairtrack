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
  loadContributions,
  removeFairteilerCategory,
  removeFairteilerCompany,
  removeFairteilerOrigin,
  removeTagFromFairteiler,
  updateOrigin,
  updateCategory,
  updateCompany,
} from './dal';
import { loadAuthenticatedSession } from './user/dal';
import {
  contributionEditSchema,
  contributionFormSchema,
} from '@features/contribution/schemas/contribution-schema';
import {
  NotFoundError,
  PermissionError,
  ValidationError,
} from './error-handling';
import { AuthError } from './api-helpers';
import { createAction } from './action-helpers';
import { z } from 'zod';
import { headers } from 'next/headers';
import { GenericItem, Tag, vContribution } from './db/db-types';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';

const genericItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name ist erforderlich'),
  status: z.enum(['active', 'pending', 'disabled']).optional(),
  originId: z.string().nullable().optional(),
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
  companyToUpdate: GenericItem & { originId?: string | null },
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

    // Determine which user ID to use for contribution
    let contributingUserId = session.user.id;

    // If submitAsAccessViewId is provided, verify owner permissions and get the access view user
    if (input.config.submitAsAccessViewId) {
      // Verify that the current user is an owner
      const permissionResult = await checkPermissionOnServer(headers, {
        member: ['create'], // Only owners have member create permission
      });

      if (!permissionResult.success) {
        throw new PermissionError(
          'Nur Inhaber:innen dürfen Beiträge im Namen von Zugangsprofile einreichen.',
        );
      }

      contributingUserId = input.config.submitAsAccessViewId;
    }

    await checkinContribution(
      input.config.fairteilerId,
      contributingUserId,
      input.contributions,
    );

    // Determine context-specific behavior
    const defaultRevalidatePaths = ['/hub/user/dashboard'];
    const defaultSuccessRedirect = '/hub/user/contribution/success';

    // Use config overrides or defaults based on context
    const revalidatePaths =
      input.config?.revalidatePaths ?? defaultRevalidatePaths;
    let successRedirect =
      input.config?.successRedirect ?? defaultSuccessRedirect;

    // Add submitAsAccessViewId as query parameter if provided
    if (input.config?.submitAsAccessViewId) {
      const url = new URL(successRedirect, process.env.NEXT_PUBLIC_ENV_URL);
      url.searchParams.set('submitAsUserId', input.config.submitAsAccessViewId);
      successRedirect = url.pathname + url.search;
    }

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
