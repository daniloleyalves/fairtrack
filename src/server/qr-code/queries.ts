'use server';

import { headers } from 'next/headers';
import { loadAuthenticatedSession } from '../user/dal';
import { AuthError } from '../api-helpers';
import { loadActiveQrCodesByFairteiler } from './dal';

export interface FairteilerQrCodeListItem {
  id: string;
  token: string;
  label: string | null;
  createdAt: Date;
  guestAccessView: { id: string; name: string } | null;
}

export async function getQrCodes(): Promise<FairteilerQrCodeListItem[]> {
  const session = await loadAuthenticatedSession(await headers());
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const qrCodes = await loadActiveQrCodesByFairteiler(fairteilerId);
  return qrCodes.map((qrCode) => ({
    id: qrCode.id,
    token: qrCode.token,
    label: qrCode.label,
    createdAt: qrCode.createdAt,
    guestAccessView: qrCode.guestAccessView,
  }));
}
