import 'server-only';
import { randomBytes } from 'node:crypto';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { attempt } from '@/lib/attempt';
import { db } from '../db/drizzle';
import { fairteilerQrCode } from '../db/schema';
import { handleDatabaseError } from '../error-handling';

export function generateQrToken() {
  return randomBytes(16).toString('base64url');
}

export async function loadActiveQrCodeByToken(token: string) {
  const [error, data] = await attempt(
    db.query.fairteilerQrCode.findFirst({
      where: and(
        eq(fairteilerQrCode.token, token),
        isNull(fairteilerQrCode.revokedAt),
      ),
      with: { fairteiler: true },
    }),
  );

  if (error) handleDatabaseError(error, 'loadActiveQrCodeByToken');
  return data;
}

export async function loadActiveQrCodeById(id: string) {
  const [error, data] = await attempt(
    db.query.fairteilerQrCode.findFirst({
      where: and(
        eq(fairteilerQrCode.id, id),
        isNull(fairteilerQrCode.revokedAt),
      ),
      with: { fairteiler: true },
    }),
  );

  if (error) handleDatabaseError(error, 'loadActiveQrCodeById');
  return data;
}

export async function loadActiveQrCodesByFairteiler(fairteilerId: string) {
  const [error, data] = await attempt(
    db.query.fairteilerQrCode.findMany({
      where: and(
        eq(fairteilerQrCode.fairteilerId, fairteilerId),
        isNull(fairteilerQrCode.revokedAt),
      ),
      with: {
        guestAccessView: { columns: { id: true, name: true } },
      },
      orderBy: asc(fairteilerQrCode.createdAt),
    }),
  );

  if (error) handleDatabaseError(error, 'loadActiveQrCodesByFairteiler');
  return data ?? [];
}

export async function insertQrCode(values: {
  fairteilerId: string;
  label: string | null;
  guestAccessViewId: string | null;
}) {
  const [error, data] = await attempt(
    db
      .insert(fairteilerQrCode)
      .values({ ...values, token: generateQrToken() })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'insertQrCode');
  return data?.[0];
}

export async function updateQrCode(
  id: string,
  fairteilerId: string,
  values: { label: string | null; guestAccessViewId: string | null },
) {
  const [error, data] = await attempt(
    db
      .update(fairteilerQrCode)
      .set(values)
      .where(
        and(
          eq(fairteilerQrCode.id, id),
          eq(fairteilerQrCode.fairteilerId, fairteilerId),
          isNull(fairteilerQrCode.revokedAt),
        ),
      )
      .returning(),
  );

  if (error) handleDatabaseError(error, 'updateQrCode');
  return data?.[0];
}

export async function revokeQrCode(id: string, fairteilerId: string) {
  const [error, data] = await attempt(
    db
      .update(fairteilerQrCode)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(fairteilerQrCode.id, id),
          eq(fairteilerQrCode.fairteilerId, fairteilerId),
          isNull(fairteilerQrCode.revokedAt),
        ),
      )
      .returning(),
  );

  if (error) handleDatabaseError(error, 'revokeQrCode');
  return data?.[0];
}
