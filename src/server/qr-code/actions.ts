'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { action, fairteilerAction } from '../_lib/safe-action';
import { NotFoundError, PermissionError } from '../error-handling';
import { loadFairteilerMembership } from '../fairteiler/dal';
import { auth, checkPermissionOnServer } from '@/lib/auth/auth';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import { insertQrCode, revokeQrCode, updateQrCode } from './dal';
import { FAIRTEILER_CONTRIBUTION_PATH } from './constants';

async function assertCanManageQrCodes() {
  const permissionResult = await checkPermissionOnServer(await headers(), {
    organization: ['update'],
  });
  if (!permissionResult.success) {
    throw new PermissionError(
      'Nur Inhaber:innen dürfen die QR-Codes des Fairteilers verwalten.',
    );
  }
}

async function assertGuestAccessView(
  fairteilerId: string,
  guestAccessViewId: string | null,
) {
  if (!guestAccessViewId) return;
  const membership = await loadFairteilerMembership(
    fairteilerId,
    guestAccessViewId,
  );
  if (membership?.role !== MemberRolesEnum.GUEST) {
    throw new PermissionError(
      'Bitte wähle einen aktiven Gastzugang dieses Fairteilers.',
    );
  }
}

const qrCodeFieldsSchema = z.object({
  label: z
    .string()
    .trim()
    .max(60, { message: 'Die Bezeichnung darf höchstens 60 Zeichen lang sein' })
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  guestAccessViewId: z.string().trim().min(1).nullable(),
});

export const createQrCodeAction = fairteilerAction
  .inputSchema(qrCodeFieldsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertCanManageQrCodes();
    await assertGuestAccessView(
      ctx.fairteilerId,
      parsedInput.guestAccessViewId,
    );

    return insertQrCode({ fairteilerId: ctx.fairteilerId, ...parsedInput });
  });

export const updateQrCodeAction = fairteilerAction
  .inputSchema(qrCodeFieldsSchema.extend({ id: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await assertCanManageQrCodes();
    await assertGuestAccessView(
      ctx.fairteilerId,
      parsedInput.guestAccessViewId,
    );

    const { id, ...values } = parsedInput;
    const updated = await updateQrCode(id, ctx.fairteilerId, values);
    if (!updated) throw new NotFoundError('QR-Code');
    return updated;
  });

export const revokeQrCodeAction = fairteilerAction
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await assertCanManageQrCodes();

    const revoked = await revokeQrCode(parsedInput.id, ctx.fairteilerId);
    if (!revoked) throw new NotFoundError('QR-Code');
    return { id: revoked.id };
  });

export const startQrGuestSessionAction = action.action(async () => {
  await auth.api.signInQrGuest({ headers: await headers() });
  return { redirectTo: FAIRTEILER_CONTRIBUTION_PATH };
});
