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
import { action, authedAction, fairteilerAction } from '../_lib/safe-action';
import { vContribution } from '../db/db-types';
import {
  loadFairteilerById,
  loadFairteilerMembership,
} from '../fairteiler/dal';
import { loadActiveQrCodeById } from '../qr-code/dal';
import { readScanProof } from '../qr-code/scan-proof';
import {
  QR_GUEST_MAX_ITEMS,
  QR_GUEST_MAX_TOTAL_QUANTITY,
  SCAN_GUEST_SUCCESS_PATH,
} from '../qr-code/constants';
import { assertContributionVerified } from './verification';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';
import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
} from '@/lib/auth/auth-permissions';
import {
  BACKDATE_ROLES,
  isAllowedContributionDay,
  MAX_BACKDATE_DAYS,
  resolveContributionTimestamp,
} from '@features/contribution/lib/contribution-date';

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

    const fairteiler = await loadFairteilerById(
      parsedInput.config.fairteilerId,
    );
    if (!fairteiler) {
      throw new NotFoundError('fairteiler');
    }

    await assertContributionVerified({
      fairteiler,
      user: ctx.session.user,
      location: parsedInput.config.location,
    });

    const createdAt = resolveContributionTimestamp(
      parsedInput.config.contributionDate,
    );

    if (createdAt) {
      if (!isAllowedContributionDay(parsedInput.config.contributionDate!)) {
        throw new ValidationError(
          `Das Datum darf nicht in der Zukunft oder mehr als ${MAX_BACKDATE_DAYS} Tage zurück liegen.`,
        );
      }

      const ownMembership = await loadFairteilerMembership(
        parsedInput.config.fairteilerId,
        ctx.session.user.id,
      );

      if (!ownMembership || !BACKDATE_ROLES.has(ownMembership.role)) {
        throw new PermissionError(
          'Nur Inhaber:innen, Mitglieder und Mitarbeitende dürfen Beiträge nachträglich eintragen.',
        );
      }
    }

    await checkinContribution(
      parsedInput.config.fairteilerId,
      contributingUserId,
      parsedInput.contributions,
      createdAt,
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

export const submitQrGuestContributionAction = action
  .inputSchema(contributionFormSchema)
  .action(async ({ parsedInput }) => {
    const { fairteilerId } = parsedInput.config;
    const scanAgainMessage =
      'Bitte scanne den QR-Code am Fairteiler erneut, um als Gast beizutragen.';

    const proof = await readScanProof();
    if (proof?.fairteilerId !== fairteilerId) {
      throw new PermissionError(scanAgainMessage);
    }

    const qrCode = await loadActiveQrCodeById(proof.qrCodeId);
    if (
      qrCode?.fairteilerId !== fairteilerId ||
      qrCode.fairteiler.disabled ||
      !qrCode.guestAccessViewId
    ) {
      throw new PermissionError(scanAgainMessage);
    }

    const membership = await loadFairteilerMembership(
      fairteilerId,
      qrCode.guestAccessViewId,
    );
    if (membership?.role !== MemberRolesEnum.GUEST) {
      throw new PermissionError(
        'Für diesen Fairteiler ist gerade kein Gastzugang eingerichtet.',
      );
    }

    const { contributions } = parsedInput;
    if (contributions.length <= 0) {
      throw new ValidationError('Keine Einträge gefunden.');
    }
    const totalQuantity = contributions.reduce((sum, c) => sum + c.quantity, 0);
    if (
      contributions.length > QR_GUEST_MAX_ITEMS ||
      totalQuantity > QR_GUEST_MAX_TOTAL_QUANTITY
    ) {
      throw new ValidationError(
        `Als Gast kannst du bis zu ${QR_GUEST_MAX_ITEMS} Einträge und ${QR_GUEST_MAX_TOTAL_QUANTITY} kg auf einmal eintragen.`,
      );
    }

    await checkinContribution(
      fairteilerId,
      qrCode.guestAccessViewId,
      contributions,
    );

    updateTag(PUBLIC_TOTAL_QUANTITY_TAG);

    return { redirectTo: SCAN_GUEST_SUCCESS_PATH };
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
