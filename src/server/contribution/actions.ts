'use server';

import { z } from 'zod';
import { revalidatePath, updateTag } from 'next/cache';
import { headers } from 'next/headers';
import {
  addVersionHistoryRecord,
  checkinContribution,
  loadContributions,
  PUBLIC_TOTAL_QUANTITY_TAG,
} from './dal';
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
import { authedAction, fairteilerAction } from '../_lib/safe-action';
import { vContribution } from '../db/db-types';
import { loadFairteilerMembership } from '../fairteiler/dal';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';
import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
} from '@/lib/auth/auth-permissions';

export const submitContributionAction = authedAction
  .inputSchema(contributionFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!parsedInput.config?.fairteilerId) {
      throw new AuthError('FairteilerId cannot be undefined');
    }

    if (parsedInput.contributions.length <= 0) {
      throw new ValidationError('Keine Einträge gefunden.');
    }

    let contributingUserId = ctx.session.user.id;

    if (parsedInput.config.submitAsAccessViewId) {
      const permissionResult = await checkPermissionOnServer(
        await headers(),
        { member: ['create'] },
        parsedInput.config.fairteilerId,
      );

      if (!permissionResult.success) {
        throw new PermissionError(
          'Nur Inhaber:innen dürfen Beiträge im Namen von Zugangsprofile einreichen.',
        );
      }

      const membership = await loadFairteilerMembership(
        parsedInput.config.fairteilerId,
        parsedInput.config.submitAsAccessViewId,
      );

      const membershipRole = membership?.role as MemberRolesEnum | undefined;

      if (
        !membershipRole ||
        !ACCESS_VIEW_ROLES.has(membershipRole) ||
        membershipRole === MemberRolesEnum.DISABLED
      ) {
        throw new PermissionError(
          'Das ausgewählte Zugangsprofil gehört nicht zu diesem Fairteiler.',
        );
      }

      contributingUserId = parsedInput.config.submitAsAccessViewId;
    }

    await checkinContribution(
      parsedInput.config.fairteilerId,
      contributingUserId,
      parsedInput.contributions,
    );

    updateTag(PUBLIC_TOTAL_QUANTITY_TAG);

    const defaultSuccessRedirect = '/hub/user/contribution/success';

    let successRedirect =
      parsedInput.config?.successRedirect ?? defaultSuccessRedirect;

    if (parsedInput.config?.submitAsAccessViewId) {
      const url = new URL(successRedirect, process.env.NEXT_PUBLIC_ENV_URL);
      url.searchParams.set(
        'submitAsUserId',
        parsedInput.config.submitAsAccessViewId,
      );
      successRedirect = url.pathname + url.search;
    }

    return { redirectTo: successRedirect };
  });

export const editContributionAction = fairteilerAction
  .inputSchema(contributionEditSchema)
  .action(async ({ parsedInput, ctx }) => {
    await addVersionHistoryRecord(
      ctx.fairteilerId,
      ctx.session.user.id,
      parsedInput,
    );
    revalidatePath('/hub/fairteiler/dashboard');
    return parsedInput;
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

export const exportContributionsAction = authedAction
  .inputSchema(exportContributionsSchema)
  .action(async ({ parsedInput, ctx }) => {
    let fairteilerId: string | null = null;
    if (parsedInput.scope === 'fairteiler') {
      fairteilerId = ctx.session.session.activeOrganizationId ?? null;
      if (!fairteilerId) {
        throw new AuthError('No active organization');
      }
    } else {
      if (ctx.session.user.role !== 'admin') {
        throw new AuthError('Admin access required for platform export');
      }
    }

    const contributionsResult = await loadContributions({
      fairteilerId,
      dateRange: parsedInput.dateRange,
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

    return anonymizedData satisfies vContribution[];
  });
