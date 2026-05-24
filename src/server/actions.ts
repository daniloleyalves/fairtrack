'use server';

import {
  addVersionHistoryRecord,
  checkinContribution,
  loadContributions,
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
import { vContribution } from './db/db-types';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';

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
