import 'server-only';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import { loadFairteilerMembership } from '../fairteiler/dal';
import { loadActiveQrCodeById } from './dal';
import { readScanProof } from './scan-proof';

/**
 * What the current browser's QR scan unlocks: the fairteiler it was scanned
 * at, and whether a guest access view is offered there. Null when there is no
 * valid scan, the code was revoked, or the fairteiler is disabled.
 */
export async function loadScanContext() {
  const proof = await readScanProof();
  if (!proof) return null;

  const qrCode = await loadActiveQrCodeById(proof.qrCodeId);
  if (
    !qrCode ||
    qrCode.fairteilerId !== proof.fairteilerId ||
    qrCode.fairteiler.disabled
  ) {
    return null;
  }

  let guestAccessViewId: string | null = null;
  if (qrCode.guestAccessViewId) {
    const membership = await loadFairteilerMembership(
      qrCode.fairteilerId,
      qrCode.guestAccessViewId,
    );
    if (membership?.role === MemberRolesEnum.GUEST) {
      guestAccessViewId = qrCode.guestAccessViewId;
    }
  }

  return {
    fairteiler: qrCode.fairteiler,
    qrCodeId: qrCode.id,
    guestAccessViewId,
    expiresAt: new Date(proof.exp),
  };
}
