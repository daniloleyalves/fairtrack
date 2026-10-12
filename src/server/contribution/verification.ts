import 'server-only';
import { isAtLocation } from '@/lib/geo';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import { loadFairteilerMembership } from '../fairteiler/dal';
import { loadActiveQrCodeById } from '../qr-code/dal';
import { readScanProof } from '../qr-code/scan-proof';
import { ValidationError } from '../error-handling';
import type { VerificationMethod } from '../db/db-types';

export interface ContributorLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export const NOT_VERIFIED_MESSAGE =
  'Wir konnten nicht bestätigen, dass du am Fairteiler bist. Scanne den QR-Code am Fairteiler oder erlaube den Standortzugriff in deinem Browser.';

/**
 * Whether this browser holds a valid scan proof for the fairteiler, from a
 * code that has not been revoked since it was scanned.
 */
export async function hasValidScanProof(fairteilerId: string) {
  const proof = await readScanProof();
  if (proof?.fairteilerId !== fairteilerId) return false;

  const qrCode = await loadActiveQrCodeById(proof.qrCodeId);
  return qrCode?.fairteilerId === fairteilerId;
}

/**
 * Works out how a contribution by a signed-in user is verified as happening
 * at the fairteiler, or throws if it cannot be verified.
 *
 * - Platform admins and active fairteiler members (owners, members, staff
 *   and signed-in access views) are trusted: `staff`.
 * - Otherwise a recent QR scan at this fairteiler: `qr`.
 * - Otherwise a location reading at the fairteiler: `location`.
 */
export async function resolveContributionVerification({
  fairteiler,
  user,
  location,
}: {
  fairteiler: { id: string; geoLat: string; geoLng: string };
  user: { id: string; role?: string | null };
  location?: ContributorLocation | null;
}): Promise<VerificationMethod> {
  if (user.role === 'admin') return 'staff';

  const membership = await loadFairteilerMembership(fairteiler.id, user.id);
  if (
    membership &&
    (membership.role as MemberRolesEnum) !== MemberRolesEnum.DISABLED
  ) {
    return 'staff';
  }

  if (await hasValidScanProof(fairteiler.id)) return 'qr';

  if (location) {
    const target = {
      latitude: parseFloat(fairteiler.geoLat),
      longitude: parseFloat(fairteiler.geoLng),
    };
    if (
      Number.isFinite(target.latitude) &&
      Number.isFinite(target.longitude) &&
      isAtLocation(location, target, location.accuracy)
    ) {
      return 'location';
    }
  }

  throw new ValidationError(NOT_VERIFIED_MESSAGE);
}
