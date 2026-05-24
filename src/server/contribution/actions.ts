'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  addVersionHistoryRecord,
  checkinContribution,
  loadContributions,
} from './dal';
import { loadAuthenticatedSession } from '../user/dal';
import {
  contributionEditSchema,
  contributionFormSchema,
} from '@features/contribution/schemas/contribution-schema';
import {
  NotFoundError,
  PermissionError,
  ValidationError,
} from '../error-handling';
import { AuthError } from '../api-helpers';
import { createAction } from '../action-helpers';
import { vContribution } from '../db/db-types';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';

export const submitContributionAction = createAction({
  inputSchema: contributionFormSchema,
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

    let contributingUserId = session.user.id;

    if (input.config.submitAsAccessViewId) {
      const permissionResult = await checkPermissionOnServer(headers, {
        member: ['create'],
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

    const defaultRevalidatePaths = ['/hub/user/dashboard'];
    const defaultSuccessRedirect = '/hub/user/contribution/success';

    const revalidatePaths =
      input.config?.revalidatePaths ?? defaultRevalidatePaths;
    let successRedirect =
      input.config?.successRedirect ?? defaultSuccessRedirect;

    if (input.config?.submitAsAccessViewId) {
      const url = new URL(successRedirect, process.env.NEXT_PUBLIC_ENV_URL);
      url.searchParams.set('submitAsUserId', input.config.submitAsAccessViewId);
      successRedirect = url.pathname + url.search;
    }

    revalidatePaths.forEach((path) => revalidatePath(path));

    return { redirectTo: successRedirect };
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

    return input;
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

    let fairteilerId: string | null = null;
    if (input.scope === 'fairteiler') {
      fairteilerId = session.session.activeOrganizationId ?? null;
      if (!fairteilerId) {
        throw new AuthError('No active organization');
      }
    } else {
      if (session.user.role !== 'admin') {
        throw new AuthError('Admin access required for platform export');
      }
    }

    const contributionsResult = await loadContributions({
      fairteilerId,
      dateRange: input.dateRange,
    });

    if (!contributionsResult?.data?.length) {
      throw new NotFoundError('No contributions found for export');
    }

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

    return typecheckedData;
  },
});
